import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { appointmentId, amount, description } = body;

  // Mark appointment as completed
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "completed" },
  });

  // Create the sale
  const sale = await prisma.sale.create({
    data: { appointmentId, amount, description },
  });

  // If the client has an active membership, deduct from credits
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: { include: { membership: true } } },
  });

  if (appointment?.client.membership?.status === "active") {
    const membership = appointment.client.membership;
    await prisma.membership.update({
      where: { id: membership.id },
      data: {
        membership_credit_balance: Math.max(
          0,
          membership.membership_credit_balance - amount
        ),
      },
    });
  }

  return NextResponse.json(sale, { status: 201 });
}
