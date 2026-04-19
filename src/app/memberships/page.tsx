import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { formatCents, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function completeCheckout(formData: FormData) {
  "use server";

  const appointmentId = String(formData.get("appointmentId"));
  const amount = Number(formData.get("amount"));

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "completed" },
  });

  const sale = await prisma.sale.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      amount,
      description: "Fake checkout service sale",
    },
    update: {
      amount,
      description: "Fake checkout service sale",
    },
  });

  const appointment = await prisma.appointment.findUnique({
    where: { id: sale.appointmentId },
    include: { client: { include: { membership: true } } },
  });

  const membership = appointment?.client.membership;
  if (membership?.status === "active") {
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

  revalidatePath("/memberships");
  revalidatePath("/admin");
}

export default async function MembershipsPage() {
  const [memberships, openAppointments] = await Promise.all([
    prisma.membership.findMany({
      include: { client: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { sale: null },
      include: { client: { include: { membership: true } }, provider: true },
      orderBy: { dateTime: "asc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Memberships and fake checkout</h1>
        <p className="text-sm text-muted-foreground">
          Memberships track state and integer-cent credits; checkout creates Sale rows.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {memberships.map((membership) => (
          <Card key={membership.id}>
            <CardHeader>
              <CardTitle>
                {membership.client.firstName} {membership.client.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Badge variant="secondary">{membership.status}</Badge>
              <p>
                Credit balance:{" "}
                {formatCents(membership.membership_credit_balance)}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Fake checkout queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openAppointments.map((appointment) => (
            <form
              key={appointment.id}
              action={completeCheckout}
              className="grid gap-3 rounded-md border p-3 text-sm md:grid-cols-[1fr_auto_auto]"
            >
              <input type="hidden" name="appointmentId" value={appointment.id} />
              <div>
                <p className="font-medium">
                  {appointment.client.firstName} {appointment.client.lastName} ·{" "}
                  {appointment.provider.name}
                </p>
                <p className="text-muted-foreground">
                  {formatDateTime(appointment.dateTime)}
                  {appointment.client.membership
                    ? ` · ${appointment.client.membership.status} member`
                    : " · no membership"}
                </p>
              </div>
              <select name="amount" className="h-9 rounded-md border px-2">
                <option value="7500">$75 service</option>
                <option value="9500">$95 service</option>
                <option value="12000">$120 service</option>
              </select>
              <Button type="submit">Complete checkout</Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
