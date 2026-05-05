'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { CalendarView } from '@/components/calendar-view'
import { BookingModal } from '@/components/booking-modal'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'
import { formatTimeZoneLabel } from '@/lib/timezone'

export default function CalendarPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)
  const createBooking = useMutation(api.bookings.create)
  const updateBooking = useMutation(api.bookings.update)
  const removeBooking = useMutation(api.bookings.remove)
  const bookings = useQuery(api.bookings.list, currentUser ? { status: undefined, date: undefined } : 'skip')
  const clients = useQuery(api.clients.list, currentUser ? { status: undefined, search: undefined } : 'skip')
  const settings = useQuery(api.settings.get, currentUser ? {} : 'skip')

  const selectedAvailableTimes = (() => {
    if (!selectedSlot || !settings?.availability) return undefined
    const weekday = new Date(`${selectedSlot.date}T00:00:00Z`).getUTCDay()
    const rule = settings.availability.find((entry) => entry.dayOfWeek === weekday)
    if (!rule?.enabled) return []

    const taken = new Set(
      (bookings ?? [])
        .filter((booking) => booking.date === selectedSlot.date && booking.status !== 'cancelled')
        .map((booking) => booking.startTime),
    )

    const options: string[] = []
    let cursor = rule.startTime
    while (cursor < rule.endTime) {
      const [hours, minutes] = cursor.split(':').map(Number)
      const nextHour = new Date(Date.UTC(2000, 0, 1, hours, minutes))
      nextHour.setUTCMinutes(nextHour.getUTCMinutes() + 60)
      const end = `${String(nextHour.getUTCHours()).padStart(2, '0')}:${String(nextHour.getUTCMinutes()).padStart(2, '0')}`
      if (end > rule.endTime) break
      if (!taken.has(cursor)) options.push(cursor)
      cursor = end
    }
    return options
  })()

  const handleSlotClick = (date: string, time: string) => {
    setSelectedSlot({ date, time })
    setIsModalOpen(true)
  }

  if (
    isLoading ||
    currentUser === null ||
    bookings === undefined ||
    clients === undefined ||
    settings === undefined
  ) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading calendar...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-140px)] flex-col space-y-8">
        <PageHeader
          title="Calendar"
          description={`Manage your availability and upcoming client sessions in ${formatTimeZoneLabel(settings.user.timezone)}.`}
        />

        <div className="min-h-0 flex-1">
          <CalendarView
            bookings={bookings.map((booking) => ({
              id: booking._id,
              clientName: booking.clientName,
              date: booking.date,
              time: booking.startTime,
              type: booking.type,
            }))}
            availability={settings.availability}
            timezone={settings.user.timezone}
            onSlotClick={handleSlotClick}
            onBookingClick={(booking) => {
              const fullBooking = bookings?.find(b => b._id === booking.id);
              if (fullBooking) {
                setSelectedSlot({ date: fullBooking.date, time: fullBooking.startTime });
                setIsModalOpen(true);
              }
            }}
          />
        </div>

        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDate={selectedSlot?.date}
          selectedTime={selectedSlot?.time}
          availableTimes={selectedAvailableTimes}
          timezone={settings.user.timezone}
          clients={clients.map((client) => ({ id: client._id, name: client.name }))}
          initialData={(() => {
            const booking = bookings?.find(b => b.date === selectedSlot?.date && b.startTime === selectedSlot?.time);
            if (booking) {
              return {
                id: booking._id,
                clientId: booking.clientId,
                clientName: booking.clientName,
                date: booking.date,
                startTime: booking.startTime,
                type: booking.type,
              }
            }
            return undefined;
          })()}
          onSubmit={async (values) => {
            if (values.id) {
              await updateBooking({
                bookingId: values.id as any,
                clientId: values.clientId as any,
                date: values.date,
                startTime: values.startTime,
                type: values.type,
              })
            } else {
              await createBooking({
                clientId: values.clientId as any,
                clientName: values.clientName,
                date: values.date,
                startTime: values.startTime,
                type: values.type,
              })
            }
          }}
        />
      </div>
    </DashboardLayout>
  )
}
