import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventDate = searchParams.get("eventDate");

  const notes = await prisma.note.findMany({
    where: eventDate ? { eventDate } : undefined,
    orderBy: [{ eventDate: "desc" }, { time: "asc" }],
  });
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const note = await prisma.note.create({
    data: {
      eventDate: body.eventDate,
      time: body.time,
      title: body.title,
      content: body.content || null,
    },
  });
  return NextResponse.json(note, { status: 201 });
}
