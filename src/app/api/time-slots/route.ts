import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const slots = await prisma.timeSlot.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(slots);
}

export async function POST(request: Request) {
  const body = await request.json();
  const slot = await prisma.timeSlot.create({
    data: {
      startTime: body.startTime,
      endTime: body.endTime,
      order: body.order || 0,
    },
  });
  return NextResponse.json(slot, { status: 201 });
}
