'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { ClientHeader } from '@/components/client-header'
import { BookingList } from '@/components/booking-list'
import { NotesPanel } from '@/components/notes-panel'
import { TaskList } from '@/components/task-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Calendar, FileText } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { BookingModal } from '@/components/booking-modal'
import { NoteFormDialog } from '@/components/note-form-dialog'
import { useCurrentUser } from '@/hooks/use-current-user'

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function durationBetween(start: string, end: string) {
  const [startHours, startMinutes] = start.split(':').map(Number)
  const [endHours, endMinutes] = end.split(':').map(Number)
  const totalMinutes = endHours * 60 + endMinutes - (startHours * 60 + startMinutes)
  if (totalMinutes <= 0) return '1h'
  if (totalMinutes % 60 === 0) return `${totalMinutes / 60}h`
  return `${(totalMinutes / 60).toFixed(1)}h`
}

export default function ClientProfilePage({ params }: { params: { clientId: string } }) {
  const { currentUser, isLoading } = useCurrentUser()
  const clientData = useQuery(api.clients.get, currentUser ? { clientId: params.clientId as any } : 'skip')
  const toggleTask = useMutation(api.tasks.toggle)
  const createTask = useMutation(api.tasks.create)
  const addNote = useMutation(api.clients.addNote)
  const createBooking = useMutation(api.bookings.create)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  if (isLoading || currentUser === null || clientData === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading client...</div>
      </DashboardLayout>
    )
  }

  const { client, bookings, notes, tasks } = clientData
  const totalRevenue = bookings.reduce((sum: number, booking: any) => sum + (booking.amountCents ?? 0), 0)
  const averageBookingValue = bookings.length ? totalRevenue / bookings.length : 0

  const overviewStats = [
    {
      id: '1',
      label: 'Total Revenue',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue / 100),
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: '2',
      label: 'Bookings',
      value: String(bookings.length),
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: '3',
      label: 'Avg. Booking Value',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(averageBookingValue / 100),
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Client Profile"
          description="Manage and track all interactions with this client"
        />

        <ClientHeader
          name={client.name}
          email={client.email ?? 'No email on file'}
          phone={client.phone ?? 'No phone on file'}
          location={client.location ?? 'No location set'}
          status={client.status}
          joinDate={client.joinedOn}
          avatar={client.imageUrl ?? ''}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overviewStats.map((stat) => (
            <Card key={stat.id} className="border border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <div className="text-muted-foreground">{stat.icon}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BookingList
              bookings={bookings.map((booking: any) => ({
                id: booking._id,
                projectName: booking.title,
                date: booking.date,
                time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
                duration: durationBetween(booking.startTime, booking.endTime),
                status: booking.status === 'upcoming' ? 'scheduled' : booking.status,
              }))}
            />
            <NotesPanel
              notes={notes.map((note: any) => ({
                id: note._id,
                content: note.content,
                date: new Date(note.createdOn).toLocaleDateString(),
                author: note.authorName,
              }))}
              onAddNote={() => setNoteOpen(true)}
            />
          </div>

          <div className="space-y-6">
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full gap-2 justify-start" variant="outline" onClick={() => setBookingOpen(true)}>
                  <Calendar className="w-4 h-4" />
                  Add Booking
                </Button>
                <Button className="w-full gap-2 justify-start" variant="outline" onClick={() => setNoteOpen(true)}>
                  <FileText className="w-4 h-4" />
                  Add Note
                </Button>
                <Button className="w-full gap-2 justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4" />
                  Messaging Coming Soon
                </Button>
              </CardContent>
            </Card>

            <TaskList
              tasks={tasks.map((task: any) => ({
                id: task._id,
                title: task.title,
                completed: task.completed,
                client: client.name,
                dueDate: task.dueDate,
              }))}
              onTaskToggle={(taskId) => toggleTask({ taskId: taskId as any })}
              onAddTask={(title) => createTask({ title, clientId: client._id, dueDate: new Date().toISOString().split('T')[0] })}
            />
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
            clientId: (values.clientId ?? client._id) as any,
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
        description="Capture context so future you always knows what happened."
        onSubmit={(content) => addNote({ clientId: client._id, content })}
      />
    </DashboardLayout>
  )
}
