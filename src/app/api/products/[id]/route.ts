import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const sizes: string[] = body.isClothing && body.sizes ? JSON.parse(body.sizes) : [];

  // Sync sizeStocks: delete removed sizes, upsert current sizes
  if (body.isClothing !== undefined) {
    if (body.isClothing && sizes.length > 0) {
      // Delete sizes that are no longer in the list
      await prisma.productSizeStock.deleteMany({
        where: { productId: id, size: { notIn: sizes } },
      });
      // Upsert each size (keep existing stock, create new with 0)
      for (const size of sizes) {
        await prisma.productSizeStock.upsert({
          where: { productId_size: { productId: id, size } },
          update: {},
          create: { productId: id, size, stock: 0 },
        });
      }
    } else {
      // Not clothing anymore — remove all sizeStocks
      await prisma.productSizeStock.deleteMany({ where: { productId: id } });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      sku: body.sku,
      unit: body.unit,
      price: body.price,
      description: body.description,
      image: body.image,
      isClothing: body.isClothing,
      sizes: body.sizes,
    },
    include: { sizeStocks: { orderBy: { size: "asc" } } },
  });
  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
