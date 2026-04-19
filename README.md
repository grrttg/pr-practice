# PR Practice

A small Next.js practice-management app for PR review reps. It is intentionally
minimal, but it has enough real surface area to review scheduling, CRM, intake,
admin dashboards, and membership/checkout state.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Prisma + SQLite

## Features

- Appointment booking with provider selection and in-memory time slots
- Client list and detail pages with editable notes
- Three-section intake form with saved responses
- Admin dashboard with weekly appointment counts and recent activity
- Membership records with `trial`, `active`, `lapsed`, and `cancelled` states
- Fake checkout flow that creates `Sale` rows using integer cents

## Getting Started

Install dependencies:

```bash
npm install
```

Create and seed the local SQLite database:

```bash
npm run db:reset
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful Commands

```bash
npm run lint
npm run build
npm run db:push
npm run db:seed
npm run db:reset
```

## Notes

This is not a production app. It is a starter for review practice, so the data,
authentication, and payment behavior are deliberately fake and lightweight.
