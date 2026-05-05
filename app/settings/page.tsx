'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/profile'
import { AvailabilitySettings } from '@/components/settings/availability'
import { NotificationSettings } from '@/components/settings/notifications'
import { BillingSettings } from '@/components/settings/billing'
import { User, Clock, Bell, CreditCard } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function SettingsPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const settings = useQuery(api.settings.get, currentUser ? {} : 'skip')
  const billing = useQuery(api.billing.summary, currentUser ? {} : 'skip')

  if (isLoading || currentUser === null || settings === undefined || billing === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading settings...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Settings"
          description="Manage your account preferences and system configuration."
        />

        <Tabs defaultValue="profile" className="w-full">
          <div className="border-b border-border mb-8 overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 gap-6 w-full justify-start rounded-none">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 gap-2 transition-all hover:text-primary"
              >
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 gap-2 transition-all hover:text-primary"
              >
                <Clock className="w-4 h-4" />
                Availability
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 gap-2 transition-all hover:text-primary"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 gap-2 transition-all hover:text-primary"
              >
                <CreditCard className="w-4 h-4" />
                Billing
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="max-w-4xl">
            <TabsContent value="profile" className="focus-visible:outline-none focus-visible:ring-0">
              <ProfileSettings user={settings.user} settings={settings.settings ?? undefined} />
            </TabsContent>
            <TabsContent value="availability" className="focus-visible:outline-none focus-visible:ring-0">
              <AvailabilitySettings timezone={settings.user.timezone} availability={settings.availability} />
            </TabsContent>
            <TabsContent value="notifications" className="focus-visible:outline-none focus-visible:ring-0">
              <NotificationSettings notifications={settings.settings?.notifications} />
            </TabsContent>
            <TabsContent value="billing" className="focus-visible:outline-none focus-visible:ring-0">
              <BillingSettings subscription={billing.subscription} usage={billing.usage} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
