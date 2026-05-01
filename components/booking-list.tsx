'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface Booking {
  id: string
  projectName: string
  date: string
  time: string
  duration: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface BookingListProps {
  bookings: Booking[]
}

export function BookingList({ bookings }: BookingListProps) {
  const statusConfig = {
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>{bookings.length} total bookings</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">{booking.projectName}</p>
                  <Badge className={statusConfig[booking.status].className}>
                    {statusConfig[booking.status].label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {booking.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {booking.time} ({booking.duration})
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
