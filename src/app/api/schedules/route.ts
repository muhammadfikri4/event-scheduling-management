import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventDate = searchParams.get("eventDate");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: Record<string, unknown> = {};

  if (eventDate) {
    where.eventDate = eventDate;
  } else if (startDate && endDate) {
    where.eventDate = { gte: startDate, lte: endDate };
  }

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      team: true,
      competitionType: true,
      timeSlot: true,
    },
    orderBy: [
      { timeSlot: { order: "asc" } },
      { competitionType: { name: "asc" } },
    ],
  });
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const body = await request.json();
  const schedule = await prisma.schedule.create({
    data: {
      teamId: body.teamId,
      competitionTypeId: body.competitionTypeId,
      timeSlotId: body.timeSlotId,
      eventDate: body.eventDate,
      status: body.status || "pending",
    },
    include: {
      team: true,
      competitionType: true,
      timeSlot: true,
    },
  });
  return NextResponse.json(schedule, { status: 201 });
}
