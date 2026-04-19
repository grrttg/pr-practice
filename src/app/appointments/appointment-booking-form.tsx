"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { PROVIDERS, TIME_SLOTS } from "@/lib/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AppointmentOption = {
  id: string;
  providerId: string;
  dateTime: string;
  duration: number;
  clientName: string;
};

type ClientOption = {
  id: string;
  fullName: string;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Saving..." : "Book"}
    </Button>
  );
}

function buildDateTime(date: string, time: string) {
  if (!date || !time) {
    return null;
  }

  return new Date(`${date}T${time}:00`);
}

export function AppointmentBookingForm({
  clients,
  appointments,
  action,
}: {
  clients: ClientOption[];
  appointments: AppointmentOption[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [providerId, setProviderId] = useState(PROVIDERS[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIME_SLOTS[0] ?? "");

  const conflict = useMemo(() => {
    const requestedStart = buildDateTime(date, time);
    if (!requestedStart || !providerId) {
      return null;
    }

    const requestedEnd = new Date(requestedStart.getTime() + 60 * 60_000);

    return (
      appointments.find((appointment) => {
        if (appointment.providerId !== providerId) {
          return false;
        }

        const existingStart = new Date(appointment.dateTime);
        if (existingStart.toISOString().slice(0, 10) !== date) {
          return false;
        }

        const existingEnd = new Date(
          existingStart.getTime() + appointment.duration * 60_000
        );

        return requestedStart < existingEnd && requestedEnd > existingStart;
      }) ?? null
    );
  }, [appointments, date, providerId, time]);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-5">
      <label className="space-y-2">
        <Label>Client</Label>
        <select name="clientId" className="h-9 rounded-md border px-2 text-sm">
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.fullName}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <Label>Provider</Label>
        <select
          name="providerId"
          className="h-9 rounded-md border px-2 text-sm"
          value={providerId}
          onChange={(event) => setProviderId(event.target.value)}
        >
          {PROVIDERS.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <Label>Date</Label>
        <Input
          name="date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      <label className="space-y-2">
        <Label>Time</Label>
        <select
          name="time"
          className="h-9 rounded-md border px-2 text-sm"
          value={time}
          onChange={(event) => setTime(event.target.value)}
        >
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <SubmitButton disabled={Boolean(conflict)} />
      </div>

      {conflict ? (
        <p className="md:col-span-5 text-sm text-destructive">
          This provider already has an appointment at this time
          <span className="text-muted-foreground">
            {" "}
            ({conflict.clientName})
          </span>
        </p>
      ) : null}
    </form>
  );
}
