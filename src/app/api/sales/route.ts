import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      include: { items: { include: { product: true, bundle: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.sale.count(),
  ]);

  return NextResponse.json({ data: sales, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    items = [], bundles = [], paidAmount, note, customerName, discountType, discountValue,
  } = body as {
    items: { productId: string; quantity: number; price: number; size?: string }[];
    bundles: { bundleId: string; quantity: number; price: number }[];
    paidAmount: number;
    note?: string;
    customerName?: string;
    discountType?: "percent" | "nominal";
    discountValue?: number;
  };

  if (!items.length && !bundles.length) {
    return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
  }

  // Build sale item records for DB
  const saleItemsData: { productId?: string; bundleId?: string; quantity: number; price: number; size: string | null; subtotal: number }[] = [];

  // Regular items
  for (const item of items) {
    saleItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      size: item.size || null,
      subtotal: item.price * item.quantity,
    });
  }

  // Bundle items — record as bundleId reference, expand for stock decrement
  const bundleLines: { bundleItems: { productId: string; quantity: number; size: string | null }[]; quantity: number }[] = [];

  for (const b of bundles) {
    const bundle = await prisma.bundle.findUnique({
      where: { id: b.bundleId },
      include: { items: { include: { product: true } } },
    });
    if (!bundle) return NextResponse.json({ error: "Bundling tidak ditemukan" }, { status: 400 });

    bundleLines.push({
      quantity: b.quantity,
      bundleItems: bundle.items.map((bi) => ({ productId: bi.productId, quantity: bi.quantity, size: bi.size })),
    });

    saleItemsData.push({
      bundleId: bundle.id,
      quantity: b.quantity,
      price: b.price,
      size: null,
      subtotal: b.price * b.quantity,
    });
  }

  const subtotalAmount = saleItemsData.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate discount
  let discountAmount = 0;
  if (discountType && discountValue && discountValue > 0) {
    discountAmount = discountType === "percent"
      ? Math.round(subtotalAmount * discountValue / 100)
      : discountValue;
  }
  if (discountAmount > subtotalAmount) discountAmount = subtotalAmount;

  const totalAmount = subtotalAmount - discountAmount;

  if (paidAmount < totalAmount) {
    return NextResponse.json({ error: "Pembayaran kurang" }, { status: 400 });
  }

  // Validate stock — regular items
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 400 });
    if (product.isClothing && item.size) {
      const ss = await prisma.productSizeStock.findUnique({ where: { productId_size: { productId: item.productId, size: item.size } } });
      if (!ss || ss.stock < item.quantity) return NextResponse.json({ error: `Stok ${product.name} ukuran ${item.size} tidak mencukupi` }, { status: 400 });
    } else if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stok ${product.name} tidak mencukupi` }, { status: 400 });
    }
  }

  // Validate stock — bundle items
  for (const bl of bundleLines) {
    for (const bi of bl.bundleItems) {
      const product = await prisma.product.findUnique({ where: { id: bi.productId } });
      if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 400 });
      const needed = bi.quantity * bl.quantity;
      if (product.isClothing && bi.size) {
        const ss = await prisma.productSizeStock.findUnique({ where: { productId_size: { productId: bi.productId, size: bi.size } } });
        if (!ss || ss.stock < needed) return NextResponse.json({ error: `Stok ${product.name} ukuran ${bi.size} tidak mencukupi` }, { status: 400 });
      } else if (product.stock < needed) {
        return NextResponse.json({ error: `Stok ${product.name} tidak mencukupi` }, { status: 400 });
      }
    }
  }

  // Generate invoice number
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const todayCount = await prisma.sale.count({ where: { invoiceNumber: { startsWith: `INV-${dateStr}` } } });
  const invoiceNumber = `INV-${dateStr}-${String(todayCount + 1).padStart(4, "0")}`;

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        invoiceNumber,
        subtotalAmount,
        discountType: discountType || null,
        discountValue: discountValue || 0,
        discountAmount,
        totalAmount,
        paidAmount,
        changeAmount: paidAmount - totalAmount,
        customerName: customerName || null,
        cashierName: session.name,
        note: note || null,
        createdBy: session.userId,
        items: {
          create: saleItemsData.map((item) => ({
            productId: item.productId || null,
            bundleId: item.bundleId || null,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { items: { include: { product: true, bundle: true } } },
    });

    // Decrement stock — regular items
    for (const item of items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      if (item.size) {
        await tx.productSizeStock.update({ where: { productId_size: { productId: item.productId, size: item.size } }, data: { stock: { decrement: item.quantity } } });
      }
    }

    // Decrement stock — bundle items (per individual product)
    for (const bl of bundleLines) {
      for (const bi of bl.bundleItems) {
        const qty = bi.quantity * bl.quantity;
        await tx.product.update({ where: { id: bi.productId }, data: { stock: { decrement: qty } } });
        if (bi.size) {
          await tx.productSizeStock.update({ where: { productId_size: { productId: bi.productId, size: bi.size } }, data: { stock: { decrement: qty } } });
        }
      }
    }

    return created;
  });

  return NextResponse.json(sale, { status: 201 });
}
