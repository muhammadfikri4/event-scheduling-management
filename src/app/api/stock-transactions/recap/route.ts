import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "in" or "out"

  const transactions = await prisma.stockTransaction.findMany({
    where: type ? { type } : undefined,
    select: {
      id: true,
      type: true,
      quantity: true,
      createdAt: true,
      product: { select: { unit: true, price: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const recapMap = new Map<string, { date: string; count: number; totalQty: number; totalValue: number }>();

  for (const t of transactions) {
    const date = t.createdAt.toISOString().split("T")[0];
    const value = t.quantity * t.product.price;
    const existing = recapMap.get(date);
    if (existing) {
      existing.count++;
      existing.totalQty += t.quantity;
      existing.totalValue += value;
    } else {
      recapMap.set(date, { date, count: 1, totalQty: t.quantity, totalValue: value });
    }
  }

  return NextResponse.json(Array.from(recapMap.values()));
}
