import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentBookingForm } from "./appointment-booking-form";

async function bookAppointment(formData: FormData) {
  "use server";

  const clientId = String(formData.get("clientId"));
  const providerId = String(formData.get("providerId"));
  const date = String(formData.get("date"));
  const time = String(formData.get("time"));
  const requestedStart = new Date(`${date}T${time}:00`);
  const requestedEnd = new Date(requestedStart.getTime() + 60 * 60_000);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      providerId,
      status: { not: "cancelled" },
    },
  });

  const hasConflict = existingAppointments.some((appointment) => {
    const existingStart = new Date(appointment.dateTime);
    if (existingStart.toISOString().slice(0, 10) !== date) {
      return false;
    }

    const existingEnd = new Date(
      existingStart.getTime() + appointment.duration * 60_000
    );

    return requestedStart < existingEnd && requestedEnd > existingStart;
  });

  if (hasConflict) {
    revalidatePath("/appointments");
    return;
  }

  await prisma.appointment.create({
    data: {
      clientId,
      providerId,
      dateTime: requestedStart,
      duration: 60,
      status: "scheduled",
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/admin");
}

export default async function AppointmentsPage() {
  const [clients, appointments, bookingAppointments] = await Promise.all([
    prisma.client.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.appointment.findMany({
      include: { client: true, provider: true },
      orderBy: { dateTime: "asc" },
      take: 12,
    }),
    prisma.appointment.findMany({
      include: { client: true },
      where: { status: { not: "cancelled" } },
      orderBy: { dateTime: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Appointment booking</h1>
        <p className="text-sm text-muted-foreground">
          Pick a client, provider, and in-memory time slot to create a scheduled appointment.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Book a time slot</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentBookingForm
            clients={clients.map((client) => ({
              id: client.id,
              fullName: `${client.firstName} ${client.lastName}`,
            }))}
            appointments={bookingAppointments.map((appointment) => ({
              id: appointment.id,
              providerId: appointment.providerId,
              dateTime: appointment.dateTime.toISOString(),
              duration: appointment.duration,
              clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
            }))}
            action={bookAppointment}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming and recent appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{formatDateTime(appointment.dateTime)}</TableCell>
                  <TableCell>
                    {appointment.client.firstName} {appointment.client.lastName}
                  </TableCell>
                  <TableCell>{appointment.provider.name}</TableCell>
                  <TableCell>{appointment.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
