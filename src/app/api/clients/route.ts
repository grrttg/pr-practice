import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const clients = await prisma.client.findMany({
    include: { membership: true },
    orderBy: { lastName: "asc" },
  });
  return NextResponse.json(clients);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, notes } = body;

  const client = await prisma.client.update({
    where: { id },
    data: { notes },
  });

  return NextResponse.json(client);
}
