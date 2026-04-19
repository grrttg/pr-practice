import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.sale.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.intakeForm.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.client.deleteMany();
  await prisma.provider.deleteMany();

  // Create providers
  const providers = await Promise.all([
    prisma.provider.create({
      data: { id: "prov-1", name: "Dr. Sarah Chen", specialty: "General Wellness" },
    }),
    prisma.provider.create({
      data: { id: "prov-2", name: "Dr. James Martinez", specialty: "Sports Recovery" },
    }),
    prisma.provider.create({
      data: { id: "prov-3", name: "Dr. Aisha Patel", specialty: "Nutrition" },
    }),
  ]);

  // Create 10 clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        id: "cli-1",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        phone: "555-0101",
        notes: "Prefers morning appointments",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-2",
        firstName: "Bob",
        lastName: "Smith",
        email: "bob@example.com",
        phone: "555-0102",
        notes: "Has a dog allergy",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-3",
        firstName: "Carol",
        lastName: "Williams",
        email: "carol@example.com",
        phone: "555-0103",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-4",
        firstName: "David",
        lastName: "Brown",
        email: "david@example.com",
        phone: "555-0104",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-5",
        firstName: "Eve",
        lastName: "Davis",
        email: "eve@example.com",
        phone: "555-0105",
        notes: "Referred by Bob Smith",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-6",
        firstName: "Frank",
        lastName: "Miller",
        email: "frank@example.com",
        phone: "555-0106",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-7",
        firstName: "Grace",
        lastName: "Wilson",
        email: "grace@example.com",
        phone: "555-0107",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-8",
        firstName: "Henry",
        lastName: "Moore",
        email: "henry@example.com",
        phone: "555-0108",
        notes: "Vegetarian",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-9",
        firstName: "Iris",
        lastName: "Taylor",
        email: "iris@example.com",
        phone: "555-0109",
      },
    }),
    prisma.client.create({
      data: {
        id: "cli-10",
        firstName: "Jack",
        lastName: "Anderson",
        email: "jack@example.com",
        phone: "555-0110",
      },
    }),
  ]);

  // Create memberships for 3 clients (various statuses)
  await Promise.all([
    prisma.membership.create({
      data: {
        clientId: "cli-1",
        status: "active",
        membership_credit_balance: 15000, // $150
      },
    }),
    prisma.membership.create({
      data: {
        clientId: "cli-3",
        status: "trial",
        membership_credit_balance: 5000, // $50
      },
    }),
    prisma.membership.create({
      data: {
        clientId: "cli-5",
        status: "lapsed",
        membership_credit_balance: 0,
      },
    }),
  ]);

  // Create 20 appointments spread across recent dates
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(9, 0, 0, 0);

  const appointmentData = [];
  for (let i = 0; i < 20; i++) {
    const dayOffset = Math.floor(i / 3) - 2; // spread across past and future days
    const hourOffset = (i % 3) * 2; // 9am, 11am, 1pm
    const dt = new Date(startOfWeek);
    dt.setDate(dt.getDate() + dayOffset);
    dt.setHours(9 + hourOffset, 0, 0, 0);

    const clientIndex = i % 10;
    const providerIndex = i % 3;
    const isPast = dt < now;

    appointmentData.push({
      id: `appt-${i + 1}`,
      dateTime: dt,
      duration: 60,
      status: isPast ? "completed" : "scheduled",
      clientId: clients[clientIndex].id,
      providerId: providers[providerIndex].id,
    });
  }

  await Promise.all(
    appointmentData.map((a) => prisma.appointment.create({ data: a }))
  );

  // Create sales for some completed appointments
  const completedAppts = appointmentData.filter((a) => a.status === "completed");
  const servicePrices = [8500, 12000, 7500, 15000, 9500]; // cents

  for (let i = 0; i < Math.min(completedAppts.length, 5); i++) {
    await prisma.sale.create({
      data: {
        appointmentId: completedAppts[i].id,
        amount: servicePrices[i],
        description: ["General Consultation", "Sports Recovery Session", "Nutrition Assessment", "Wellness Package", "Follow-up Visit"][i],
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
