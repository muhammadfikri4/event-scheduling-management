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
      include: { items: { include: { product: true } } },
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
  const { items, paidAmount, note } = body as {
    items: { productId: string; quantity: number; price: number; size?: string }[];
    paidAmount: number;
    note?: string;
  };

  if (!items?.length) {
    return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (paidAmount < totalAmount) {
    return NextResponse.json({ error: "Pembayaran kurang" }, { status: 400 });
  }

  // Validate stock
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || product.stock < item.quantity) {
      return NextResponse.json({ error: `Stok ${product?.name || "produk"} tidak mencukupi` }, { status: 400 });
    }
  }

  // Generate invoice number: INV-YYYYMMDD-XXXX
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  const todayCount = await prisma.sale.count({
    where: {
      invoiceNumber: { startsWith: `INV-${dateStr}` },
    },
  });
  const invoiceNumber = `INV-${dateStr}-${String(todayCount + 1).padStart(4, "0")}`;

  // Create sale + items + decrement stock atomically
  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        invoiceNumber,
        totalAmount,
        paidAmount,
        changeAmount: paidAmount - totalAmount,
        note: note || null,
        createdBy: session.userId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Decrement stock for each item
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json(sale, { status: 201 });
}
