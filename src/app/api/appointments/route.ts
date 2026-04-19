import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: { client: true, provider: true },
    orderBy: { dateTime: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, providerId, dateTime, duration } = body;

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      providerId,
      dateTime: new Date(dateTime),
      duration: duration || 60,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
