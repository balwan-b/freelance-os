'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { BookingCard, BookingStatus } from '@/components/booking-card'
import { FilterBar } from '@/components/filter-bar'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { BookingModal } from '@/components/booking-modal'
import { useCurrentUser } from '@/hooks/use-current-user'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function BookingsPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [bookingOpen, setBookingOpen] = useState(false)
  const createBooking = useMutation(api.bookings.create)
  const bookings = useQuery(api.bookings.list, currentUser ? {
    status: statusFilter === 'all' ? undefined : statusFilter,
    date: dateFilter ? dateFilter.toISOString().split('T')[0] : undefined,
  } : 'skip')
  const clients = useQuery(api.clients.list, currentUser ? { status: undefined, search: undefined } : 'skip')

  const handleClearFilters = () => {
    setStatusFilter('all')
    setDateFilter(undefined)
  }

  if (isLoading || currentUser === null || bookings === undefined || clients === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading bookings...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Bookings"
          description="Manage your schedule and track client interactions."
          action={
            <Button size="sm" className="gap-2" onClick={() => setBookingOpen(true)}>
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          }
        />

        <FilterBar
          currentStatus={statusFilter}
          currentDate={dateFilter}
          onStatusChange={setStatusFilter}
          onDateChange={setDateFilter}
          onClearFilters={handleClearFilters}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold capitalize">
                {statusFilter === 'all' ? 'All Bookings' : `${statusFilter} Bookings`}
              </h2>
              <span className="bg-muted px-2 py-0.5 rounded text-xs font-medium text-muted-foreground ml-2">
                {bookings.length}
              </span>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking: any) => (
                <BookingCard
                  key={booking._id}
                  id={booking._id}
                  clientName={booking.clientName}
                  date={formatDate(booking.date)}
                  time={`${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`}
                  status={booking.status}
                  type={booking.type}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-2xl border border-dashed border-border">
              <div className="p-4 rounded-full bg-muted mb-4">
                <CalendarIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No bookings found</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Try adjusting your filters or create a new booking to get started.
              </p>
              <Button variant="outline" className="mt-6" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
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
    </DashboardLayout>
  )
}
