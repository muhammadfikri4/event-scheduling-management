import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "in" or "out"

  const where: Record<string, unknown> = {};
  if (type) where.type = type;

  const transactions = await prisma.stockTransaction.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const session = await verifySession();
  const body = await request.json();
  const { productId, type, quantity, note, size, pic } = body;

  // Validate note required for outgoing
  if (type === "out" && !note?.trim()) {
    return NextResponse.json({ error: "Catatan wajib diisi untuk barang keluar" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  // Validate stock for outgoing
  if (type === "out") {
    if (product.isClothing && size) {
      // Check per-size stock
      const sizeStock = await prisma.productSizeStock.findUnique({
        where: { productId_size: { productId, size } },
      });
      if (!sizeStock || sizeStock.stock < quantity) {
        return NextResponse.json({ error: `Stok ukuran ${size} tidak mencukupi` }, { status: 400 });
      }
    } else if (product.stock < quantity) {
      return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    }
  }

  // Build atomic operations
  const ops = [
    prisma.stockTransaction.create({
      data: {
        productId, type, quantity, note: note || null, size: size || null, pic: pic || null,
        createdBy: session?.userId || null,
        createdByName: session?.name || null,
      },
      include: { product: true },
    }),
    // Always update total stock on Product
    prisma.product.update({
      where: { id: productId },
      data: {
        stock: type === "in" ? { increment: quantity } : { decrement: quantity },
      },
    }),
  ];

  // If clothing with size, also update per-size stock
  if (product.isClothing && size) {
    ops.push(
      prisma.productSizeStock.upsert({
        where: { productId_size: { productId, size } },
        update: {
          stock: type === "in" ? { increment: quantity } : { decrement: quantity },
        },
        create: { productId, size, stock: type === "in" ? quantity : 0 },
      }) as never
    );
  }

  const [transaction] = await prisma.$transaction(ops);

  return NextResponse.json(transaction, { status: 201 });
}
