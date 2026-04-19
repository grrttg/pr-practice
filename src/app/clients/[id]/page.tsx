import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { formatCents, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

async function updateNotes(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const notes = String(formData.get("notes"));

  await prisma.client.update({
    where: { id },
    data: { notes },
  });

  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
}

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      membership: true,
      appointments: {
        include: { provider: true, sale: true },
        orderBy: { dateTime: "desc" },
      },
      intakeForms: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {client.firstName} {client.lastName}
        </h1>
        <p className="text-sm text-muted-foreground">
          {client.email} · {client.phone ?? "No phone"}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateNotes} className="space-y-3">
              <input type="hidden" name="id" value={client.id} />
              <Textarea name="notes" defaultValue={client.notes ?? ""} />
              <Button type="submit">Save notes</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>History timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.membership && (
              <div className="rounded-md border p-3">
                <Badge variant="secondary">{client.membership.status}</Badge>
                <p className="mt-2 text-sm">
                  Membership credits:{" "}
                  {formatCents(client.membership.membership_credit_balance)}
                </p>
              </div>
            )}
            {client.appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">
                  {formatDateTime(appointment.dateTime)} with{" "}
                  {appointment.provider.name}
                </p>
                <p className="text-muted-foreground">
                  Status: {appointment.status}
                  {appointment.sale
                    ? ` · Sale: ${formatCents(appointment.sale.amount)}`
                    : ""}
                </p>
              </div>
            ))}
            {client.intakeForms.map((form) => (
              <div key={form.id} className="rounded-md border p-3 text-sm">
                Intake form {form.status} on {formatDateTime(form.createdAt)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
