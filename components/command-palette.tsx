'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import {
  ArrowRight,
  Calendar,
  CheckSquare2,
  Inbox,
  LayoutGrid,
  MessageSquare,
  Plus,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'
import { BookingModal } from './booking-modal'
import { ClientFormDialog } from './client-form-dialog'
import { InquiryFormDialog } from './inquiry-form-dialog'

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function formatBookingLabel(date: string, startTime: string) {
  const stamp = new Date(`${date}T${startTime}`)
  return stamp.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen
  const router = useRouter()

  const { currentUser } = useCurrentUser()
  const clients = useQuery(api.clients.list, open && currentUser ? {} : 'skip')
  const tasks = useQuery(api.tasks.list, open && currentUser ? {} : 'skip')
  const bookings = useQuery(api.bookings.list, open && currentUser ? {} : 'skip')
  const inquiries = useQuery(api.inquiries.list, open && currentUser ? {} : 'skip')
  type Client = NonNullable<typeof clients>[number]
  type Task = NonNullable<typeof tasks>[number]
  type Booking = NonNullable<typeof bookings>[number]
  type Inquiry = NonNullable<typeof inquiries>[keyof NonNullable<typeof inquiries>][number]

  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isClientOpen, setIsClientOpen] = useState(false)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)

  const createBooking = useMutation(api.bookings.create)
  const createClient = useMutation(api.clients.create)
  const createInquiry = useMutation(api.inquiries.create)

  const openAndClose = (action: () => void) => {
    action()
    setOpen(false)
  }

  const inquiryItems = useMemo(() => {
    if (!inquiries) return []
    return Object.values(inquiries)
      .flatMap((stageItems) => stageItems)
      .slice(0, 8)
  }, [inquiries])

  const upcomingBookings = useMemo(
    () =>
      (bookings ?? [])
        .filter((booking) => booking.status === 'upcoming')
        .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`))
        .slice(0, 8),
    [bookings],
  )

  const openTaskView = (filter?: string) => {
    router.push(filter ? `/tasks?view=${filter}` : '/tasks')
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a client, task, booking, or action..." />
        <CommandList className="max-h-[70vh]">
          <CommandEmpty>No matches yet. Try a client name, task, or booking date.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => openAndClose(() => router.push('/dashboard'))}>
              <LayoutGrid className="mr-3 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Open Dashboard</span>
                <span className="text-xs text-muted-foreground">Return to your operational home base</span>
              </div>
              <CommandShortcut>G D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => openAndClose(() => setIsClientOpen(true))}>
              <Users className="mr-3 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Add Client</span>
                <span className="text-xs text-muted-foreground">Create a new client record</span>
              </div>
              <CommandShortcut>New</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => openAndClose(() => setIsBookingOpen(true))}>
              <Calendar className="mr-3 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Schedule Booking</span>
                <span className="text-xs text-muted-foreground">Create a call, session, or project booking</span>
              </div>
              <CommandShortcut>Book</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => openAndClose(() => setIsInquiryOpen(true))}>
              <Plus className="mr-3 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Capture Inquiry</span>
                <span className="text-xs text-muted-foreground">Log a new lead without leaving your flow</span>
              </div>
              <CommandShortcut>Lead</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Jump to Client">
            {(clients ?? []).slice(0, 10).map((client: Client) => (
              <CommandItem
                key={client._id}
                onSelect={() => openAndClose(() => router.push(`/clients/${client._id}`))}
                keywords={[client.email ?? '', client.phone ?? '', 'client hub']}
              >
                <Users className="mr-3 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{client.name}</span>
                  <span className="text-xs text-muted-foreground">{client.email || 'Open client hub'}</span>
                </div>
                <CommandShortcut>Hub</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Tasks">
            <CommandItem onSelect={() => openAndClose(() => openTaskView('today'))}>
              <CheckSquare2 className="mr-3 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Open Today&apos;s Tasks</span>
                <span className="text-xs text-muted-foreground">Focus on what needs attention now</span>
              </div>
              <CommandShortcut>Today</CommandShortcut>
            </CommandItem>
            {(tasks ?? []).slice(0, 8).map((task: Task) => (
              <CommandItem
                key={task._id}
                onSelect={() =>
                  openAndClose(() =>
                    router.push(task.clientId ? `/clients/${task.clientId}` : '/tasks'),
                  )
                }
                keywords={[task.title, task.dueDate ?? '', task.completed ? 'completed' : 'pending']}
              >
                <CheckSquare2 className="mr-3 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{task.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {task.dueDate ? `Due ${task.dueDate}` : 'No due date'}
                  </span>
                </div>
                <CommandShortcut>{task.completed ? 'Done' : 'Open'}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Upcoming Bookings">
            {(upcomingBookings ?? []).map((booking: Booking) => (
              <CommandItem
                key={booking._id}
                onSelect={() =>
                  openAndClose(() => router.push(booking.clientId ? `/clients/${booking.clientId}` : '/bookings'))
                }
                keywords={[booking.clientName, booking.type, booking.date]}
              >
                <Calendar className="mr-3 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{booking.clientName}</span>
                  <span className="text-xs text-muted-foreground">
                    {booking.type} • {formatBookingLabel(booking.date, booking.startTime)}
                  </span>
                </div>
                <CommandShortcut>Next</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Pipeline">
            {(inquiryItems ?? []).map((inquiry: Inquiry) => (
              <CommandItem
                key={inquiry._id}
                onSelect={() => openAndClose(() => router.push('/inquiries'))}
                keywords={[inquiry.name, inquiry.service, inquiry.stage]}
              >
                <MessageSquare className="mr-3 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{inquiry.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {inquiry.service} • {inquiry.stage}
                  </span>
                </div>
                <CommandShortcut>Lead</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Workspace">
            <CommandItem onSelect={() => openAndClose(() => router.push('/calendar'))}>
              <Calendar className="mr-3 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Open Calendar</span>
                <span className="text-xs text-muted-foreground">See bookings in schedule view</span>
              </div>
              <CommandShortcut>Cal</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => openAndClose(() => router.push('/clients'))}>
              <ArrowRight className="mr-3 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Browse Clients</span>
                <span className="text-xs text-muted-foreground">Open the global client directory</span>
              </div>
              <CommandShortcut>List</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        clients={(clients || []).map((client: Client) => ({ id: client._id, name: client.name }))}
        onSubmit={async (values) => {
          await createBooking({
            clientId: values.clientId,
            clientName: values.clientName,
            date: values.date,
            startTime: values.startTime,
            type: values.type,
          })
        }}
      />

      <ClientFormDialog
        open={isClientOpen}
        onOpenChange={setIsClientOpen}
        title="Add New Client"
        description="Create a new client to start tracking their projects and bookings."
        onSubmit={async (values) => { await createClient({ ...values }); }}
      />

      <InquiryFormDialog
        open={isInquiryOpen}
        onOpenChange={setIsInquiryOpen}
        title="Log New Inquiry"
        description="Capture potential new work."
        onSubmit={async (values) => { await createInquiry({ ...values }); }}
      />
    </>
  )
}
