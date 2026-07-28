import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Delete existing members and recreate
  if (body.members !== undefined) {
    await prisma.teamMember.deleteMany({ where: { teamId: id } });
  }

  const team = await prisma.team.update({
    where: { id },
    data: {
      name: body.name,
      color: body.color,
      logo: body.logo,
      managerName: body.managerName,
      managerPhone: body.managerPhone,
      members: body.members?.length
        ? { create: body.members.map((m: { name: string }) => ({ name: m.name })) }
        : undefined,
    },
    include: { members: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(team);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
