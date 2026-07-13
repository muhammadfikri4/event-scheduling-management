import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const slot = await prisma.timeSlot.update({
    where: { id },
    data: {
      startTime: body.startTime,
      endTime: body.endTime,
      order: body.order,
    },
  });
  return NextResponse.json(slot);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.timeSlot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
