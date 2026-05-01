'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { CalendarView } from '@/components/calendar-view'
import { BookingModal } from '@/components/booking-modal'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'

export default function CalendarPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null)
  const createBooking = useMutation(api.bookings.create)
  const bookings = useQuery(api.bookings.list, currentUser ? { status: undefined, date: undefined } : 'skip')
  const clients = useQuery(api.clients.list, currentUser ? { status: undefined, search: undefined } : 'skip')

  const handleSlotClick = (date: Date, time: string) => {
    setSelectedSlot({ date, time })
    setIsModalOpen(true)
  }

  if (isLoading || currentUser === null || bookings === undefined || clients === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading calendar...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
        <PageHeader
          title="Calendar"
          description="Manage your availability and upcoming client sessions."
        />

        <div className="flex-1 min-h-0">
          <CalendarView
            bookings={bookings.map((booking: any) => ({
              id: booking._id,
              clientName: booking.clientName,
              date: booking.date,
              time: booking.startTime,
              type: booking.type,
            }))}
            onSlotClick={handleSlotClick}
          />
        </div>

        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedSlot?.date}
          selectedTime={selectedSlot?.time}
          clients={clients.map((client: any) => ({ id: client._id, name: client.name }))}
          onSubmit={(values) =>
            createBooking({
              clientId: values.clientId as any,
              clientName: values.clientName,
              date: values.date,
              startTime: values.startTime,
              type: values.type,
            })
          }
        />
      </div>
    </DashboardLayout>
  )
}
