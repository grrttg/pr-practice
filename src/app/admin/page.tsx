import { prisma } from "@/lib/db";
import { formatCents, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const [appointmentsThisWeek, clients, sales, recentAppointments] =
    await Promise.all([
      prisma.appointment.count({
        where: { dateTime: { gte: weekStart, lt: weekEnd } },
      }),
      prisma.client.count(),
      prisma.sale.aggregate({ _sum: { amount: true } }),
      prisma.appointment.findMany({
        include: { client: true, provider: true, sale: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Fake role-gated operations view for weekly counts and recent activity.
          </p>
        </div>
        <Badge variant="secondary">Role: admin</Badge>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Appointments this week" value={appointmentsThisWeek.toString()} />
        <Metric label="Clients" value={clients.toString()} />
        <Metric label="Booked sales" value={formatCents(sales._sum.amount ?? 0)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAppointments.map((appointment) => (
            <div key={appointment.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">
                {appointment.client.firstName} {appointment.client.lastName} ·{" "}
                {appointment.provider.name}
              </p>
              <p className="text-muted-foreground">
                {formatDateTime(appointment.dateTime)} · {appointment.status}
                {appointment.sale
                  ? ` · ${formatCents(appointment.sale.amount)} sale`
                  : ""}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-semibold">{value}</CardContent>
    </Card>
  );
}
