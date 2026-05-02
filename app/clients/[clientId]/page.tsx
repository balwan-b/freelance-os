'use client'

import { use, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { ClientHeader } from '@/components/client-header'
import { ActivityTimeline, TimelineEvent } from '@/components/activity-timeline'
import { TaskList } from '@/components/task-list'
import { BookingCard } from '@/components/booking-card'
import { BookingModal } from '@/components/booking-modal'
import { NoteFormDialog } from '@/components/note-form-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  CircleDollarSign,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export default function ClientHubPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const { currentUser, isLoading } = useCurrentUser()
  const clientData = useQuery(api.clients.get, currentUser ? { clientId } : 'skip')
  const toggleTask = useMutation(api.tasks.toggle)
  const createTask = useMutation(api.tasks.create)
  const addNote = useMutation(api.clients.addNote)
  const updateClient = useMutation(api.clients.update)
  const createBooking = useMutation(api.bookings.create)
  const updateBookingStatus = useMutation(api.bookings.updateStatus)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  type ClientData = NonNullable<typeof clientData>
  type ClientBooking = ClientData['bookings'][number]
  type ClientTask = ClientData['tasks'][number]
  type ClientNote = ClientData['notes'][number]

  const timelineEvents = useMemo<TimelineEvent[]>(
    () => {
      if (!clientData) return []
      return [
        ...clientData.bookings.map((booking) => ({
          id: `booking-${booking._id}`,
          type: 'booking' as const,
          date: new Date(`${booking.date}T${booking.startTime || '00:00'}`),
          title: booking.title,
          description: `${booking.type} with ${clientData.client.name}`,
          status: booking.status,
        })),
        ...clientData.tasks.map((task) => ({
          id: `task-${task._id}`,
          type: 'task' as const,
          date: task.dueDate ? new Date(`${task.dueDate}T12:00:00`) : new Date(task._creationTime),
          title: task.title,
          status: task.completed ? 'completed' : 'pending',
        })),
        ...clientData.notes.map((note) => ({
          id: `note-${note._id}`,
          type: 'note' as const,
          date: new Date(note.createdOn),
          title: 'Note added',
          description: note.content,
        })),
      ]
    },
    [clientData],
  )

  if (isLoading || currentUser === null || clientData === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading client...</div>
      </DashboardLayout>
    )
  }

  const { client, bookings, notes, tasks } = clientData
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.amountCents ?? 0), 0)
  const averageBookingValue = bookings.length ? totalRevenue / bookings.length : 0
  const completedTasks = tasks.filter((task) => task.completed).length
  const nextBooking = bookings
    .filter((booking) => booking.status === 'upcoming')
    .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))[0]

  const summaryCards = [
    {
      label: 'Revenue',
      value: formatCurrency(totalRevenue),
      icon: <CircleDollarSign className="w-5 h-5" />,
      helper: bookings.length ? `${bookings.length} total booking(s)` : 'No payments recorded yet',
    },
    {
      label: 'Next Booking',
      value: nextBooking ? formatDate(nextBooking.date) : 'No booking',
      icon: <Calendar className="w-5 h-5" />,
      helper: nextBooking ? `${formatTime(nextBooking.startTime)} • ${nextBooking.type}` : 'Schedule the next touchpoint',
    },
    {
      label: 'Task Progress',
      value: `${completedTasks}/${tasks.length}`,
      icon: <Sparkles className="w-5 h-5" />,
      helper: tasks.length ? 'Completed versus total tasks' : 'No tasks yet',
    },
    {
      label: 'Average Booking',
      value: bookings.length ? formatCurrency(averageBookingValue) : '$0',
      icon: <FileText className="w-5 h-5" />,
      helper: 'Useful for pricing and scope context',
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Client Hub"
          description="Everything for this client lives here: bookings, tasks, notes, timeline, and next actions."
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setNoteOpen(true)}>
                <FileText className="w-4 h-4" />
                Add Note
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setBookingOpen(true)}>
                <Calendar className="w-4 h-4" />
                Schedule Booking
              </Button>
            </div>
          }
        />

        <ClientHeader
          name={client.name}
          email={client.email ?? 'No email on file'}
          phone={client.phone ?? 'No phone on file'}
          location={client.location ?? 'No location set'}
          status={client.status}
          joinDate={client.joinedOn}
          avatar={client.imageUrl ?? ''}
          onNameChange={(name) => updateClient({ clientId: client._id, name })}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                  <div className="text-muted-foreground">{card.icon}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{card.value}</div>
                <p className="mt-1 text-sm text-muted-foreground">{card.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_0.75fr]">
          <Tabs defaultValue="overview" className="w-full">
            <div className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-6 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Project Activity</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A fast view of what is moving, blocked, or due next.
                    </p>
                  </div>
                  <Badge variant="secondary">{tasks.filter((task) => !task.completed).length} open task(s)</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nextBooking ? (
                    <div className="rounded-xl border border-border px-4 py-3">
                      <p className="text-sm font-medium">Next booking</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(nextBooking.date)} at {formatTime(nextBooking.startTime)} • {nextBooking.type}
                      </p>
                    </div>
                  ) : null}
                  {notes[0] ? (
                    <div className="rounded-xl border border-border px-4 py-3">
                      <p className="text-sm font-medium">Latest note</p>
                      <p className="mt-1 text-sm text-muted-foreground">{notes[0].content}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                      No notes yet. Capture client context so the relationship stays easy to pick back up.
                    </div>
                  )}
                </CardContent>
              </Card>

              <ActivityTimeline events={timelineEvents.slice(0, 8)} />
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Bookings</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Schedule, complete, and review work without leaving this client context.
                    </p>
                  </div>
                  <Button size="sm" className="gap-2" onClick={() => setBookingOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add Booking
                  </Button>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {bookings.map((booking: ClientBooking) => (
                        <BookingCard
                          key={booking._id}
                          id={booking._id}
                          clientName={booking.clientName}
                          date={formatDate(booking.date)}
                          time={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
                          status={booking.status}
                          type={booking.type}
                          onStatusChange={(id, status) => updateBookingStatus({ bookingId: id, status })}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                      No bookings yet. Schedule the first meeting or project checkpoint from this hub.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskList
                    tasks={tasks.map((task: ClientTask) => ({
                      id: task._id,
                      title: task.title,
                      completed: task.completed,
                      client: client.name,
                      dueDate: task.dueDate,
                    }))}
                    onTaskToggle={(taskId) => toggleTask({ taskId })}
                    onAddTask={(title) =>
                      createTask({
                        title,
                        clientId: client._id,
                        dueDate: new Date().toISOString().split('T')[0],
                      })
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">Notes</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Keep decisions, reminders, and meeting context attached to the relationship.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setNoteOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notes.length > 0 ? (
                    notes.map((note: ClientNote) => (
                      <div key={note._id} className="rounded-xl border border-border px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">{note.authorName}</p>
                          <span className="text-xs text-muted-foreground">{new Date(note.createdOn).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                      No notes yet. Add internal context here instead of scattering it across messages or memory.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <ActivityTimeline events={timelineEvents} />
            </TabsContent>
          </Tabs>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setBookingOpen(true)}>
                  <Calendar className="w-4 h-4" />
                  Schedule Booking
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setNoteOpen(true)}>
                  <FileText className="w-4 h-4" />
                  Add Note
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline" disabled>
                  <MessageSquare className="w-4 h-4" />
                  Client Messaging
                </Button>
                <p className="text-xs text-muted-foreground">
                  Messaging and payment threads are being pulled into the hub structure next.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hub Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Relationship status</p>
                  <p className="mt-1 text-sm text-muted-foreground capitalize">{client.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last interaction</p>
                  <p className="mt-1 text-sm text-muted-foreground">{client.lastInteractionDate ?? 'No activity yet'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Open workload</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tasks.filter((task) => !task.completed).length} task(s), {bookings.filter((booking) => booking.status === 'upcoming').length} upcoming booking(s)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        defaultClientId={client._id}
        defaultClientName={client.name}
        clients={[{ id: client._id, name: client.name }]}
        onSubmit={(values) =>
          createBooking({
            clientId: values.clientId ?? client._id,
            clientName: values.clientName ?? client.name,
            date: values.date,
            startTime: values.startTime,
            type: values.type,
          })
        }
      />

      <NoteFormDialog
        open={noteOpen}
        onOpenChange={setNoteOpen}
        title="Add Client Note"
        description="Capture context so future you always know what happened."
        onSubmit={(content) => addNote({ clientId: client._id, content })}
      />
    </DashboardLayout>
  )
}
