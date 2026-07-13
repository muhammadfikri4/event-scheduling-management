import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const type = await prisma.competitionType.update({
    where: { id },
    data: {
      name: body.name,
      code: body.code,
      color: body.color,
    },
  });
  return NextResponse.json(type);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.competitionType.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
