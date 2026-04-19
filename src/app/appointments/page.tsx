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

async function bookAppointment(formData: FormData) {
  "use server";

  const clientId = String(formData.get("clientId"));
  const providerId = String(formData.get("providerId"));
  const date = String(formData.get("date"));
  const time = String(formData.get("time"));

  await prisma.appointment.create({
    data: {
      clientId,
      providerId,
      dateTime: new Date(`${date}T${time}:00`),
      duration: 60,
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
          <form action={bookAppointment} className="grid gap-4 md:grid-cols-5">
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
