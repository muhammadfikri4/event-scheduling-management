import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bundles = await prisma.bundle.findMany({
    orderBy: { name: "asc" },
    include: {
      items: {
        include: { product: { include: { sizeStocks: true } } },
        orderBy: { product: { name: "asc" } },
      },
    },
  });
  return NextResponse.json(bundles);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, sku, price, image, description, items } = body as {
    name: string; sku: string; price: number; image?: string; description?: string;
    items: { productId: string; quantity: number; size?: string }[];
  };

  const bundle = await prisma.bundle.create({
    data: {
      name,
      sku,
      price,
      image: image || null,
      description: description || null,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || null,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(bundle, { status: 201 });
}
