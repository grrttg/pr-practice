import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const statsPromise = Promise.all([
    prisma.client.count(),
    prisma.provider.count(),
    prisma.appointment.count(),
    prisma.sale.aggregate({ _sum: { amount: true } }),
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="secondary">Starter scaffold</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">
          Practice Manager
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          A deliberately small practice-management app with enough appointments,
          CRM, intake, admin, and membership logic to generate realistic PR
          review reps.
        </p>
      </section>

      <Stats statsPromise={statsPromise} />

      <section className="grid gap-4 md:grid-cols-2">
        {[
          ["Appointments", "/appointments", "Book time against provider slots."],
          ["Clients", "/clients", "Browse client records and update notes."],
          ["Intake", "/intake", "Submit a three-section intake response."],
          ["Admin", "/admin", "Review weekly counts and recent activity."],
          ["Memberships", "/memberships", "Apply credits through fake checkout."],
        ].map(([label, href, description]) => (
          <Link key={href} href={href}>
            <Card className="h-full transition hover:bg-muted/40">
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}

async function Stats({
  statsPromise,
}: {
  statsPromise: Promise<
    [number, number, number, { _sum: { amount: number | null } }]
  >;
}) {
  const [clients, providers, appointments, sales] = await statsPromise;

  return (
    <section className="grid gap-4 md:grid-cols-4">
      <Stat label="Clients" value={clients.toString()} />
      <Stat label="Providers" value={providers.toString()} />
      <Stat label="Appointments" value={appointments.toString()} />
      <Stat label="Sales" value={formatCents(sales._sum.amount ?? 0)} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  );
}
