'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { BookingCard } from '@/components/booking-card'
import { ActivityFeed } from '@/components/activity-feed'
import { PipelinePreview } from '@/components/pipeline-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCheck,
  MessageSquare,
  Search,
  TrendingUp,
} from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'

function formatTime(time?: string) {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const overview = useQuery(api.dashboard.overview, currentUser ? {} : 'skip')
  const toggleTask = useMutation(api.tasks.toggle)
  const updateBookingStatus = useMutation(api.bookings.updateStatus)
  type DashboardOverview = NonNullable<typeof overview>
  type DashboardBooking = DashboardOverview['todayBookings'][number]
  type DashboardTask = DashboardOverview['tasksDueToday'][number]
  type Notification = NonNullable<typeof currentUser>['unreadNotifications'][number]

  if (isLoading || currentUser === null || overview === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading dashboard...</div>
      </DashboardLayout>
    )
  }

  const unreadNotifications = currentUser.unreadNotifications ?? []

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title={`${getGreeting()}, ${currentUser.name?.split(' ')[0] ?? 'there'}`}
          description="Run the day from one place. Review work due now, upcoming bookings, and client signals without hopping between pages."
          action={
            <Button asChild size="sm" className="gap-2">
              <Link href="/clients">
                Open client directory
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          }
        />

        {!overview.onboardingComplete && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5">
            <p className="text-sm font-medium">Your workspace is live.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a first client or inquiry, then finish your profile and availability so this dashboard can start working for you.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{overview.todayBookings.length + overview.tasksDueToday.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {overview.todayBookings.length} booking(s), {overview.tasksDueToday.length} task(s)
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{overview.overdueTasks.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">Oldest items surface here so nothing slips.</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unread Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{unreadNotifications.length}</div>
              <p className="mt-1 text-sm text-muted-foreground">Notifications and inbound client prompts awaiting triage.</p>
            </CardContent>
          </Card>
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{formatCurrency(overview.stats.monthlyRevenue)}</div>
              <p className="mt-1 text-sm text-muted-foreground">{overview.stats.activeClients} active client(s) in motion.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
          <Card className="border-border/70">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Today&apos;s Work</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  The shortlist of what needs attention right now.
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href="/calendar">
                  <CalendarClock className="w-4 h-4" />
                  Calendar
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Bookings</h3>
                  <Badge variant="secondary">{overview.todayBookings.length}</Badge>
                </div>
                {overview.todayBookings.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {overview.todayBookings.map((booking: DashboardBooking) => (
                      <BookingCard
                        key={booking._id}
                        id={booking._id}
                        clientName={booking.clientName}
                        date="Today"
                        time={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
                        status={booking.status}
                        type={booking.type}
                        onStatusChange={(id, status) => updateBookingStatus({ bookingId: id as any, status })}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                    No bookings scheduled for today.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Tasks Due Today</h3>
                  <Badge variant="secondary">{overview.tasksDueToday.length}</Badge>
                </div>
                {overview.tasksDueToday.length > 0 ? (
                  <div className="space-y-2">
                    {overview.tasksDueToday.map((task: DashboardTask) => (
                      <div
                        key={task._id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                      >
                        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask({ taskId: task._id })} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                        </div>
                        {task.clientId ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/clients/${task.clientId}`}>Open client</Link>
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                    Nothing due today.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Needs Attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    Overdue tasks
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {overview.overdueTasks.length === 0
                      ? 'Everything is up to date.'
                      : `${overview.overdueTasks.length} task(s) need a catch-up.`}
                  </p>
                </div>

                    {overview.overdueTasks.slice(0, 3).map((task) => (
                  <div key={task._id} className="rounded-xl border border-border px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Due {task.dueDate}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => toggleTask({ taskId: task._id })}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark done
                      </Button>
                    </div>
                  </div>
                ))}

                <Button asChild variant="ghost" className="w-full justify-between">
                  <Link href="/tasks?view=all">
                    Review all tasks
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Unread Notifications</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Review recent activity and signals.</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((notification: Notification) => (
                    <div key={notification._id} className="rounded-xl border border-border px-4 py-3">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{notification.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                    No unread client signals right now.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border/70">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep the week visible without leaving the dashboard.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/bookings">
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.upcomingBookings.length > 0 ? (
                overview.upcomingBookings.map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{booking.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.type} on {formatDate(booking.date)} at {formatTime(booking.startTime)}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/clients/${booking.clientId}`}>Open hub</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No upcoming bookings yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Workspace Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  Conversion rate
                </div>
                <p className="mt-2 text-2xl font-semibold">{overview.stats.conversionRate}%</p>
              </div>
              <div className="rounded-xl border border-border px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Search className="w-4 h-4" />
                  Active inquiries
                </div>
                <p className="mt-2 text-2xl font-semibold">{overview.stats.activeInquiries}</p>
              </div>
              <div className="rounded-xl border border-border px-4 py-3">
                <p className="text-sm font-medium">Revenue snapshot</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(overview.stats.revenueThisWeek)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <PipelinePreview columns={overview.pipelineColumns} />
          <ActivityFeed activities={overview.recentActivities} />
        </div>
      </div>
    </DashboardLayout>
  )
}
