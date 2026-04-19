"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ClientOption = {
  id: string;
  firstName: string;
  lastName: string;
};

export function IntakeForm({ clients }: { clients: ClientOption[] }) {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);

  async function submit(formData: FormData) {
    setSaved(false);
    await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: formData.get("clientId"),
        personalInfo: {
          preferredName: formData.get("preferredName"),
          goals: formData.get("goals"),
        },
        medicalHistory: {
          allergies: formData.get("allergies"),
          medications: formData.get("medications"),
        },
        consent: {
          accepted: formData.get("consent") === "on",
          signature: formData.get("signature"),
        },
      }),
    });
    setSaved(true);
    setStep(1);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Three-section intake form</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={submit} className="space-y-6">
          <div className="flex gap-2 text-sm">
            {[1, 2, 3].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStep(item)}
                className={`rounded-md border px-3 py-1 ${
                  step === item ? "bg-foreground text-background" : ""
                }`}
              >
                Section {item}
              </button>
            ))}
          </div>

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

          {step === 1 && (
            <section className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <Label>Preferred name</Label>
                <Input name="preferredName" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <Label>Care goals</Label>
                <Textarea name="goals" />
              </label>
            </section>
          )}

          {step === 2 && (
            <section className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <Label>Allergies</Label>
                <Textarea name="allergies" />
              </label>
              <label className="space-y-2">
                <Label>Medications</Label>
                <Textarea name="medications" />
              </label>
            </section>
          )}

          {step === 3 && (
            <section className="grid gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input name="consent" type="checkbox" />
                Client consents to storing this sample intake response.
              </label>
              <label className="space-y-2">
                <Label>Signature</Label>
                <Input name="signature" />
              </label>
            </section>
          )}

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Next section
              </Button>
            ) : (
              <Button type="submit">Save intake</Button>
            )}
            {saved && <p className="text-sm text-muted-foreground">Saved.</p>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
