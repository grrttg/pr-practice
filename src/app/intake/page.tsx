import { prisma } from "@/lib/db";
import { IntakeForm } from "./intake-form";

export default async function IntakePage() {
  const clients = await prisma.client.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Intake form builder</h1>
        <p className="text-sm text-muted-foreground">
          Minimal multi-step intake with three sections and saved responses.
        </p>
      </section>
      <IntakeForm clients={clients} />
    </div>
  );
}
