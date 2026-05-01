'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Zap } from 'lucide-react'

interface BillingSettingsProps {
  subscription?: any
  usage?: any
}

export function BillingSettings({ subscription, usage }: BillingSettingsProps) {
  const [loadingAction, setLoadingAction] = useState<'checkout' | 'portal' | null>(null)
  const planFeatures = [
    'Unlimited bookings',
    'Custom intake forms',
    'Priority support',
    'Advanced analytics',
    'Multiple team members'
  ]

  const isPro = subscription?.plan === 'pro'
  const renewsOn = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
    : 'No renewal scheduled'

  async function handleCheckout() {
    setLoadingAction('checkout')
    const response = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await response.json()
    if (data?.url) {
      window.location.href = data.url
    }
    setLoadingAction(null)
  }

  async function handlePortal() {
    setLoadingAction('portal')
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stripeCustomerId: subscription?.stripeCustomerId }),
    })
    const data = await response.json()
    if (data?.url) {
      window.location.href = data.url
    }
    setLoadingAction(null)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="bg-primary/5 pb-8 pt-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge className="bg-primary/10 text-primary border-primary/20 uppercase tracking-widest text-[10px] font-bold">Current Plan</Badge>
              <h3 className="text-2xl font-black tracking-tight">{isPro ? 'Pro Plan' : 'Free Plan'}</h3>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black leading-none">{isPro ? '$29' : '$0'}<span className="text-sm font-medium text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground mt-1">Renews on {renewsOn}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan Features</h4>
              <ul className="space-y-2">
                {planFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Method</h4>
              <div className="p-4 rounded-xl border border-border/50 bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background border border-border shadow-sm">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {subscription?.paymentMethodBrand
                        ? `${subscription.paymentMethodBrand} ending in ${subscription?.paymentMethodLast4 ?? '----'}`
                        : 'No payment method on file'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription?.stripeCustomerId ? 'Managed in Stripe billing portal' : 'Upgrade to add billing details'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-6 flex flex-col sm:flex-row gap-3">
          <Button className="w-full sm:w-auto gap-2" onClick={handleCheckout} disabled={loadingAction !== null || isPro}>
            <Zap className="w-4 h-4 fill-current" />
            {isPro ? 'Pro Active' : 'Upgrade to Pro'}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePortal} disabled={loadingAction !== null || !subscription?.stripeCustomerId}>
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
          <CardDescription>Track your resource consumption for the current month.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
              <span>Bookings</span>
              <span className="text-muted-foreground">{usage?.bookingCount ?? 0} / {isPro ? 'Unlimited' : 100}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${isPro ? 10 : Math.min(100, ((usage?.bookingCount ?? 0) / 100) * 100)}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
              <span>Clients</span>
              <span className="text-muted-foreground">{usage?.clientCount ?? 0} / {isPro ? 'Unlimited' : 25}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${isPro ? 8 : Math.min(100, ((usage?.clientCount ?? 0) / 25) * 100)}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
