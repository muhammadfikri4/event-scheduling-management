import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
    include: { members: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const body = await request.json();
  const team = await prisma.team.create({
    data: {
      name: body.name,
      color: body.color || "#3B82F6",
      logo: body.logo || null,
      managerName: body.managerName || null,
      managerPhone: body.managerPhone || null,
      members: body.members?.length
        ? { create: body.members.map((m: { name: string }) => ({ name: m.name })) }
        : undefined,
    },
    include: { members: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json(team, { status: 201 });
}
