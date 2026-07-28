import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const note = await prisma.note.update({
    where: { id },
    data: {
      eventDate: body.eventDate,
      time: body.time,
      title: body.title,
      content: body.content,
    },
  });
  return NextResponse.json(note);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
