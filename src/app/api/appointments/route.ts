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
  const { clientId, providerId, dateTime, duration, bufferTime } = body;

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      providerId,
      dateTime: new Date(dateTime),
      duration: duration || 60,
      bufferTime: Math.min(60, Math.max(0, bufferTime || 0)),
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}
