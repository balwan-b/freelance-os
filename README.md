# Freelance OS

Freelance OS is a full-stack workspace for solo service businesses. It combines lightweight CRM, inquiry intake, scheduling, task tracking, and subscription-aware limits in one realtime product so freelancers can run day-to-day operations without stitching together multiple tools.

## Why this project exists

This repo is designed to showcase product thinking as much as implementation skill:

- A focused workflow for solo operators instead of generic CRUD
- Auth-aware backend ownership checks with Clerk + Convex
- Timezone-safe scheduling and availability enforcement
- Stripe-backed billing without exposing billing state mutations publicly
- A polished dashboard and client hub that feel like a real SaaS product

## Core workflow

1. Capture inquiries and qualify new work.
2. Convert leads into client records.
3. Schedule bookings against weekly availability.
4. Track notes, tasks, and upcoming commitments.
5. Gate paid features with subscription-aware usage limits.

## Stack

- `Next.js 16` for the application shell and UI routes
- `Convex` for database, queries, mutations, actions, and webhook handling
- `Clerk` for authentication and identity
- `Stripe` for subscriptions and billing portal sessions
- `Tailwind CSS` + Radix primitives for the UI layer

## Architecture

The frontend is a thin Next.js client over a Convex backend. Product state lives in Convex tables such as `clients`, `inquiries`, `bookings`, `tasks`, `notes`, `subscriptions`, and `usageCounters`. UI screens subscribe to Convex queries for realtime reads, while writes flow through authenticated mutations.

Stripe subscription sync is handled through the Convex HTTP endpoint at `/stripe/webhook`, which verifies the webhook signature and writes through an internal mutation. Checkout and billing-portal session creation now run through authenticated Convex actions so the billing owner is always derived server-side rather than trusted from client input.

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

1. Copy `.env.example` to `.env.local` and fill in the required values.
2. Install dependencies with `pnpm install`.
3. Start the app with `pnpm dev`.
4. Open `http://localhost:3000`.

Required environment variables:

```bash
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000

CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_JWT_ISSUER_DOMAIN=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
```

## Demo notes

For portfolio review, the best walkthrough is:

1. Sign up with a test Clerk account.
2. Complete profile + availability in Settings.
3. Create an inquiry, convert it to a client, and schedule a booking.
4. Visit the dashboard, client hub, calendar, and billing settings.

Use test Stripe credentials and non-sensitive sample data only.

## Verification

Run these commands before presenting the project:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Stripe webhook setup

Point Stripe at:

```text
https://<your-convex-deployment>/stripe/webhook
```

The Next.js route at `app/api/stripe/webhook` remains as a compatibility proxy, but the primary integration target should be the Convex webhook endpoint.

## Production-minded details

- Billing state changes are written through internal Convex mutations only.
- Billing portal ownership is resolved server-side from the authenticated user.
- Booking edits re-run availability and overlap checks instead of blindly patching schedule fields.
- Foreign-key indexes support cleanup for inquiry and client deletes.
- Large list queries are bounded to avoid unbounded `.collect()` reads in common UI paths.
- Usage counters decrement when tracked clients or bookings created in the current billing month are removed.

## Current limitations

- This repository is a portfolio/demo app, not a fully packaged commercial SaaS.
- It does not include automated seed data or end-to-end tests yet.
- Deployers are responsible for their own privacy, legal, and compliance setup.
