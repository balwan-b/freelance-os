# Freelance OS

Freelance OS is a full-stack operating system for solo service businesses. It combines lightweight CRM, inquiry intake, booking orchestration, task tracking, and subscription-aware limits in one realtime workspace so freelancers can run day-to-day operations without stitching together multiple tools.

## What it does

- Tracks leads from inquiry to conversion
- Manages clients, notes, and follow-up work
- Schedules bookings with timezone-aware availability checks
- Surfaces a daily dashboard for bookings, tasks, and activity
- Gates premium workflows with Clerk-authenticated Convex + Stripe billing

## Stack

- `Next.js 16` for the product UI and authenticated route handlers
- `Convex` for database, queries, mutations, actions, and HTTP endpoints
- `Clerk` for authentication and identity
- `Tailwind CSS` + Radix primitives for the UI layer

## Architecture

The frontend is a thin Next.js client over a Convex backend. Product state lives in Convex tables such as `clients`, `inquiries`, `bookings`, `tasks`, `notes`, `subscriptions`, and `usageCounters`. UI screens subscribe to Convex queries for realtime updates, while writes flow through authenticated mutations.

Stripe subscription sync is handled through a Convex HTTP endpoint at `/stripe/webhook`, which verifies the webhook signature and then writes through an internal Convex mutation. This keeps billing state changes off the public mutation surface.

## Core data model

- `users`: profile, timezone, onboarding state, auth linkage
- `userSettings`: profile extras and notification preferences
- `availabilityRules`: weekly scheduling windows per user
- `inquiries`: inbound leads and qualification state
- `clients`: converted or manually created customer records
- `bookings`: scheduled work, status, pricing, and normalized UTC timestamps
- `tasks`: lightweight operational todo items
- `notes`: timeline notes attached to clients or inquiries
- `subscriptions`: Stripe-backed plan state
- `usageCounters`: current-month plan enforcement counters

## Local setup

1. Install dependencies with `pnpm install`.
2. Create the required environment variables for Next.js, Clerk, Convex, and Stripe.
3. Start the app with `pnpm dev`.

Typical env vars:

```bash
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_APP_URL=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_JWT_ISSUER_DOMAIN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
```

## Stripe webhook setup

Point Stripe at:

```text
https://<your-convex-deployment>/stripe/webhook
```

The legacy Next.js webhook route at `app/api/stripe/webhook` remains as a compatibility proxy, but the primary integration should target the Convex HTTP endpoint directly.

## Production notes

- Billing mutations are internal-only; public clients cannot self-upgrade by invoking a mutation directly.
- Foreign-key indexes support cascading cleanup for inquiry and client deletes.
- Large list queries are now bounded to avoid unbounded `.collect()` reads in common UI paths.
- Usage counters decrement when tracked clients or bookings created in the current billing month are removed.

## Recruiter-friendly overview

This project is meant to demonstrate product thinking as much as implementation skill: auth-aware backend design, realtime state management, defensive billing workflows, timezone-safe scheduling, and a polished operator dashboard built around freelancer workflows instead of generic CRUD pages.
