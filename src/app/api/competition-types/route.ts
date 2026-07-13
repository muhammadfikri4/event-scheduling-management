import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const types = await prisma.competitionType.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(request: Request) {
  const body = await request.json();
  const type = await prisma.competitionType.create({
    data: {
      name: body.name,
      code: body.code,
      color: body.color || "#6366F1",
    },
  });
  return NextResponse.json(type, { status: 201 });
}
