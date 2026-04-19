import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { membership: true, appointments: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Client list</h1>
        <p className="text-sm text-muted-foreground">
          Basic CRM records with notes, memberships, and appointment history.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {clients.map((client) => (
          <Link key={client.id} href={`/clients/${client.id}`}>
            <Card className="h-full transition hover:bg-muted/40">
              <CardHeader>
                <CardTitle>
                  {client.firstName} {client.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{client.email}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{client.appointments.length} appts</Badge>
                  {client.membership ? (
                    <Badge variant="secondary">
                      {client.membership.status} ·{" "}
                      {formatCents(client.membership.membership_credit_balance)}
                    </Badge>
                  ) : (
                    <Badge variant="ghost">no membership</Badge>
                  )}
                </div>
                <p>{client.notes ?? "No notes yet."}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
