import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: { sizeStocks: { orderBy: { size: "asc" } } },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const sizes: string[] = body.isClothing && body.sizes ? JSON.parse(body.sizes) : [];

  const product = await prisma.product.create({
    data: {
      name: body.name,
      sku: body.sku,
      unit: body.unit || "pcs",
      stock: body.stock || 0,
      price: body.price || 0,
      description: body.description || null,
      image: body.image || null,
      isClothing: body.isClothing || false,
      sizes: body.sizes || null,
      sizeStocks: sizes.length > 0
        ? { create: sizes.map((s: string) => ({ size: s, stock: 0 })) }
        : undefined,
    },
    include: { sizeStocks: { orderBy: { size: "asc" } } },
  });
  return NextResponse.json(product, { status: 201 });
}
