import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function getBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured yet' }, { status: 500 })
  }

  const { stripeCustomerId } = await request.json()
  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found for this account' }, { status: 400 })
  }

  const body = new URLSearchParams({
    customer: stripeCustomerId,
    return_url: `${getBaseUrl(request)}/settings`,
  })

  const response = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await response.json()
  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message ?? 'Stripe portal failed' }, { status: 500 })
  }

  return NextResponse.json({ url: data.url })
}
