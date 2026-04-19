import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, personalInfo, medicalHistory, consent } = body;

  const form = await prisma.intakeForm.create({
    data: {
      clientId,
      personalInfo: personalInfo ? JSON.stringify(personalInfo) : null,
      medicalHistory: medicalHistory ? JSON.stringify(medicalHistory) : null,
      consent: consent ? JSON.stringify(consent) : null,
      status: consent ? "complete" : "incomplete",
    },
  });

  return NextResponse.json(form, { status: 201 });
}
