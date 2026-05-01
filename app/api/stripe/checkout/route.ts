import { auth, currentUser } from '@clerk/nextjs/server'
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

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID_PRO) {
    return NextResponse.json(
      { error: 'Stripe is not configured yet' },
      { status: 500 },
    )
  }

  const user = await currentUser()
  const baseUrl = getBaseUrl(request)
  const body = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': process.env.STRIPE_PRICE_ID_PRO,
    'line_items[0][quantity]': '1',
    customer_email: user?.emailAddresses?.[0]?.emailAddress ?? '',
    client_reference_id: userId,
    success_url: `${baseUrl}/settings?billing=success`,
    cancel_url: `${baseUrl}/settings?billing=cancelled`,
    allow_promotion_codes: 'true',
    'subscription_data[metadata][clerkUserId]': userId,
  })

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await response.json()
  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message ?? 'Stripe checkout failed' }, { status: 500 })
  }

  return NextResponse.json({ url: data.url })
}
