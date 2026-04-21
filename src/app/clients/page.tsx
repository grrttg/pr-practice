import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCents, formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ClientsPageProps = {
  searchParams?: {
    sort?: string;
    direction?: string;
  };
};

function buildSortHref(
  sort: string,
  currentSort: string,
  currentDirection: string
) {
  const nextDirection =
    currentSort === sort && currentDirection === "asc" ? "desc" : "asc";

  return `/clients?sort=${sort}&direction=${nextDirection}`;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const sort = searchParams?.sort === "last-seen" ? "last-seen" : "name";
  const direction = searchParams?.direction === "desc" ? "desc" : "asc";
  const now = new Date();
  const clients = await prisma.client.findMany({
    include: {
      membership: true,
      appointments: {
        where: {
          status: "completed",
          dateTime: { lte: now },
        },
        orderBy: { dateTime: "desc" },
        take: 1,
      },
    },
  });

  const clientsWithLastSeen = clients.map((client) => ({
    ...client,
    lastSeen: client.appointments[0]?.dateTime ?? null,
  }));

  const sortedClients = [...clientsWithLastSeen].sort((left, right) => {
    if (sort === "last-seen") {
      if (!left.lastSeen && !right.lastSeen) {
        return 0;
      }

      if (!left.lastSeen) {
        return 1;
      }

      if (!right.lastSeen) {
        return -1;
      }

      const difference = left.lastSeen.getTime() - right.lastSeen.getTime();
      return direction === "asc" ? difference : -difference;
    }

    const nameComparison = `${left.lastName}, ${left.firstName}`.localeCompare(
      `${right.lastName}, ${right.firstName}`
    );

    return direction === "asc" ? nameComparison : -nameComparison;
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Client list</h1>
        <p className="text-sm text-muted-foreground">
          Basic CRM records with notes, memberships, and appointment history.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>All clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Link
                    className="inline-flex items-center gap-1 hover:underline"
                    href={buildSortHref("name", sort, direction)}
                  >
                    Name
                    {sort === "name" ? (direction === "asc" ? "↑" : "↓") : null}
                  </Link>
                </TableHead>
                <TableHead>
                  <Link
                    className="inline-flex items-center gap-1 hover:underline"
                    href={buildSortHref("last-seen", sort, direction)}
                  >
                    Last seen
                    {sort === "last-seen"
                      ? direction === "asc"
                        ? "↑"
                        : "↓"
                      : null}
                  </Link>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link className="font-medium hover:underline" href={`/clients/${client.id}`}>
                      {client.firstName} {client.lastName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </TableCell>
                  <TableCell>
                    {client.lastSeen ? formatShortDate(client.lastSeen) : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">—</span>
                  </TableCell>
                  <TableCell>
                    {client.membership ? (
                      <Badge variant="secondary">
                        {client.membership.status} ·{" "}
                        {formatCents(client.membership.membership_credit_balance)}
                      </Badge>
                    ) : (
                      <Badge variant="ghost">no membership</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-64 whitespace-normal text-muted-foreground">
                    {client.notes ?? "No notes yet."}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
