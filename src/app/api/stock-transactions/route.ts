import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const body = await request.json();
  const { productId, type, quantity, note } = body;

  // Validate stock for outgoing
  if (type === "out") {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.stock < quantity) {
      return NextResponse.json({ error: "Stok tidak mencukupi" }, { status: 400 });
    }
  }

  // Create transaction and update stock atomically
  const [transaction] = await prisma.$transaction([
    prisma.stockTransaction.create({
      data: { productId, type, quantity, note: note || null },
      include: { product: true },
    }),
    prisma.product.update({
      where: { id: productId },
      data: {
        stock: type === "in"
          ? { increment: quantity }
          : { decrement: quantity },
      },
    }),
  ]);

  return NextResponse.json(transaction, { status: 201 });
}
