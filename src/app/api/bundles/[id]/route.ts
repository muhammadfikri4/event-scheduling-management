import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, sku, price, image, description, items } = body as {
    name: string; sku: string; price: number; image?: string; description?: string;
    items?: { productId: string; quantity: number; size?: string }[];
  };

  if (items !== undefined) {
    await prisma.bundleItem.deleteMany({ where: { bundleId: id } });
  }

  const bundle = await prisma.bundle.update({
    where: { id },
    data: {
      name,
      sku,
      price,
      image: image,
      description: description,
      items: items?.length
        ? {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.size || null,
            })),
          }
        : undefined,
    },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(bundle);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.bundle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
