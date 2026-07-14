import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emitScheduleEvent } from "@/lib/socket-emit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const schedule = await prisma.schedule.update({
    where: { id },
    data: {
      teamId: body.teamId,
      competitionTypeId: body.competitionTypeId,
      timeSlotId: body.timeSlotId,
      eventDate: body.eventDate,
      status: body.status,
    },
    include: {
      team: true,
      competitionType: true,
      timeSlot: true,
    },
  });
  emitScheduleEvent("schedule_updated");
  return NextResponse.json(schedule);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.schedule.delete({ where: { id } });
  emitScheduleEvent("schedule_deleted");
  return NextResponse.json({ success: true });
}
