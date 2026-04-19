import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { PROVIDERS, TIME_SLOTS } from "@/lib/providers";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

async function bookAppointment(formData: FormData) {
  "use server";

  const clientId = String(formData.get("clientId"));
  const providerId = String(formData.get("providerId"));
  const date = String(formData.get("date"));
  const time = String(formData.get("time"));
  const duration = 60;
  const bufferTime = Math.min(60, Math.max(0, Number(formData.get("bufferTime")) || 0));

  const requestedStart = new Date(`${date}T${time}:00`);
  const requestedEnd = new Date(requestedStart.getTime() + (duration + bufferTime) * 60_000);

  // Check for conflicts with the provider's existing appointments (including their buffers)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      providerId,
      status: { not: "cancelled" },
    },
  });

  const hasConflict = existingAppointments.some((appt) => {
    const existingStart = new Date(appt.dateTime);
    const existingEnd = new Date(
      existingStart.getTime() + (appt.duration + appt.bufferTime) * 60_000
    );
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });

  if (hasConflict) {
    // Redirect back — the page will re-render and the user can pick a different slot.
    // In a real app this would be a toast or inline error; for now we revalidate
    // so the user sees the current schedule and can adjust.
    revalidatePath("/appointments");
    return;
  }

  await prisma.appointment.create({
    data: {
      clientId,
      providerId,
      dateTime: requestedStart,
      duration,
      bufferTime,
      status: "scheduled",
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/admin");
}

export default async function AppointmentsPage() {
  const [clients, appointments] = await Promise.all([
    prisma.client.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.appointment.findMany({
      include: { client: true, provider: true },
      orderBy: { dateTime: "asc" },
      take: 12,
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
          <form action={bookAppointment} className="grid gap-4 md:grid-cols-6">
            <label className="space-y-2">
              <Label>Client</Label>
              <select name="clientId" className="h-9 rounded-md border px-2 text-sm">
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <Label>Provider</Label>
              <select name="providerId" className="h-9 rounded-md border px-2 text-sm">
                {PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <Label>Date</Label>
              <Input name="date" type="date" required />
            </label>
            <label className="space-y-2">
              <Label>Time</Label>
              <select name="time" className="h-9 rounded-md border px-2 text-sm">
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <Label>Buffer (min)</Label>
              <Input
                name="bufferTime"
                type="number"
                defaultValue={0}
                min={0}
                max={60}
                required
              />
            </label>
            <div className="flex items-end">
              <Button type="submit">Book</Button>
            </div>
          </form>
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
              {appointments.map((appointment) => {
                const start = new Date(appointment.dateTime);
                const end = new Date(
                  start.getTime() + appointment.duration * 60_000
                );
                const bufferEnd =
                  appointment.bufferTime > 0
                    ? new Date(
                        end.getTime() + appointment.bufferTime * 60_000
                      )
                    : null;

                return (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <span>{formatDateTime(appointment.dateTime)}</span>
                      {bufferEnd && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          +{appointment.bufferTime}m buffer until{" "}
                          {formatTime(bufferEnd)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {appointment.client.firstName}{" "}
                      {appointment.client.lastName}
                    </TableCell>
                    <TableCell>{appointment.provider.name}</TableCell>
                    <TableCell>{appointment.status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
