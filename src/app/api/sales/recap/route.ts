import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sales = await prisma.sale.findMany({
    select: {
      id: true,
      createdAt: true,
      totalAmount: true,
      discountAmount: true,
      subtotalAmount: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by date
  const recapMap = new Map<string, { date: string; count: number; subtotal: number; discount: number; total: number }>();

  for (const sale of sales) {
    const date = sale.createdAt.toISOString().split("T")[0];
    const existing = recapMap.get(date);
    if (existing) {
      existing.count++;
      existing.subtotal += sale.subtotalAmount;
      existing.discount += sale.discountAmount;
      existing.total += sale.totalAmount;
    } else {
      recapMap.set(date, {
        date,
        count: 1,
        subtotal: sale.subtotalAmount,
        discount: sale.discountAmount,
        total: sale.totalAmount,
      });
    }
  }

  return NextResponse.json(Array.from(recapMap.values()));
}
