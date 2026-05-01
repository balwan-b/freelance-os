'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { BookingCard } from '@/components/booking-card'
import { ActivityFeed } from '@/components/activity-feed'
import { PipelinePreview } from '@/components/pipeline-preview'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { TrendingUp, MessageSquare, Plus } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'

function formatTime(time?: string) {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function Home() {
  const { currentUser, isLoading } = useCurrentUser()
  const overview = useQuery(api.dashboard.overview, currentUser ? {} : 'skip')

  if (isLoading || currentUser === null || overview === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title={`Good morning, ${currentUser?.name?.split(' ')[0] ?? 'there'}`}
          description="Here is your live control center. What should you do today?"
          action={
            <Button size="sm" className="gap-2 hidden sm:flex">
              <Plus className="w-4 h-4" />
              Quick Add
            </Button>
          }
        />

        {!overview.onboardingComplete && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
            <p className="text-sm font-medium">Your workspace is live.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first client or inquiry, then save your profile and availability to complete onboarding.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Today</h2>
            <p className="text-sm text-muted-foreground">
              {overview.todayBookings.length} booking(s) scheduled
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.todayBookings.length > 0 ? (
              overview.todayBookings.map((booking: any) => (
                <BookingCard
                  key={booking._id}
                  id={booking._id}
                  clientName={booking.clientName}
                  date="Today"
                  time={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
                  status={booking.status}
                  type={booking.type}
                />
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No bookings scheduled for today.
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Tasks Due Today</h3>
            <div className="space-y-2">
              {overview.tasksDueToday.length > 0 ? (
                overview.tasksDueToday.map((task: any) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <Checkbox checked={task.completed} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Nothing due today.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <PipelinePreview columns={overview.pipelineColumns} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Revenue This Month"
            description="Completed bookings"
            value={formatCurrency(overview.stats.monthlyRevenue)}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ value: 0, label: 'tracking live', isPositive: true }}
          />
          <StatCard
            title="Conversion Rate"
            description="Bookings versus active clients"
            value={`${overview.stats.conversionRate}%`}
            icon={<MessageSquare className="w-5 h-5" />}
            trend={{ value: 0, label: 'based on live data', isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityFeed activities={overview.recentActivities} />
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Quick Stats</p>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold">{overview.stats.activeInquiries}</p>
                  <p className="text-xs text-muted-foreground">Open inquiries</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-2xl font-bold">{overview.stats.activeClients}</p>
                  <p className="text-xs text-muted-foreground">Active clients</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-2xl font-bold">{formatCurrency(overview.stats.revenueThisWeek)}</p>
                  <p className="text-xs text-muted-foreground">Revenue snapshot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
