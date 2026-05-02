'use client'

import React, { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeSlot } from './time-slot'
import { cn } from '@/lib/utils'
import { buildHourlySlots, formatTimeZoneLabel, getDateKeyInTimeZone, utcToZonedDateTimeParts } from '@/lib/timezone'

interface Booking {
  id: string
  clientName: string
  date: string
  time: string
  type: string
}

interface AvailabilityRule {
  dayOfWeek: number
  enabled: boolean
  startTime: string
  endTime: string
}

interface CalendarViewProps {
  bookings: Booking[]
  availability: AvailabilityRule[]
  timezone: string
  onSlotClick: (date: string, time: string) => void
  onBookingClick?: (booking: Booking) => void
}

function weekdayIndexFromDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

function formatDisplayDate(date: Date, timezone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone, ...options }).format(date)
}

export function CalendarView({ bookings, availability, timezone, onSlotClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDayOfMonth = startOfWeek(monthStart, { weekStartsOn: 1 })
  const paddingDaysCount = Math.floor((monthStart.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24))
  const paddingDays = Array.from({ length: paddingDaysCount }, (_, i) => addDays(firstDayOfMonth, i))

  const rulesByDay = useMemo(
    () => new Map(availability.map((rule) => [rule.dayOfWeek, rule])),
    [availability],
  )
  const nowInTimeZone = utcToZonedDateTimeParts(new Date(), timezone)

  const timeSlots = useMemo(() => {
    const enabledRules = availability.filter((rule) => rule.enabled)
    if (enabledRules.length === 0) {
      return ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
    }

    const earliest = enabledRules.reduce((lowest, rule) => (rule.startTime < lowest ? rule.startTime : lowest), enabledRules[0]!.startTime)
    const latest = enabledRules.reduce((highest, rule) => (rule.endTime > highest ? rule.endTime : highest), enabledRules[0]!.endTime)
    return buildHourlySlots(earliest, latest)
  }, [availability])

  const availableTimesByDate = useMemo(() => {
    const slots = new Map<string, Set<string>>()
    const allDates = [...paddingDays, ...monthDays, ...weekDays]

    allDates.forEach((day) => {
      const dateKey = getDateKeyInTimeZone(day, timezone)
      const weekday = weekdayIndexFromDate(dateKey)
      const rule = rulesByDay.get(weekday)
      const enabledTimes = new Set<string>()

      if (rule?.enabled) {
        timeSlots.forEach((time) => {
          if (time >= rule.startTime && time < rule.endTime && buildHourlySlots(time, rule.endTime).length > 0) {
            const endCandidate = `${String(Number(time.slice(0, 2)) + 1).padStart(2, '0')}:${time.slice(3, 5)}`
            if (endCandidate <= rule.endTime) {
              enabledTimes.add(time)
            }
          }
        })
      }

      bookings.forEach((booking) => {
        if (booking.date === dateKey) {
          enabledTimes.delete(booking.time)
        }
      })

      slots.set(dateKey, enabledTimes)
    })

    return slots
  }, [bookings, monthDays, paddingDays, rulesByDay, timeSlots, timezone, weekDays])

  const handlePrev = () => {
    if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1))
    else setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1))
    else setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => setCurrentDate(new Date())

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center justify-between gap-4 border-b border-border p-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="min-w-[150px] text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <p className="text-xs text-muted-foreground">{formatTimeZoneLabel(timezone)}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 font-medium" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'week' | 'month')}>
          <TabsList className="bg-muted">
            <TabsTrigger value="week" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        {viewMode === 'week' ? (
          <div className="flex min-w-[860px] flex-col">
            <div className="sticky top-0 z-10 flex border-b border-border bg-card">
              <div className="w-20 border-r border-border" />
              {weekDays.map((day) => {
                const dateKey = getDateKeyInTimeZone(day, timezone)
                return (
                  <div
                    key={dateKey}
                    className={cn(
                      'flex-1 border-r border-border py-3 text-center last:border-0',
                      nowInTimeZone.date === dateKey && 'bg-primary/5',
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {formatDisplayDate(day, timezone, { weekday: 'short' })}
                    </p>
                    <p className={cn('mt-1 text-lg font-bold', nowInTimeZone.date === dateKey && 'text-primary')}>
                      {formatDisplayDate(day, timezone, { day: 'numeric' })}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="relative flex">
              <div className="w-20 border-r border-border bg-muted/20">
                {timeSlots.map((hour) => (
                  <div key={hour} className="flex h-20 items-start justify-center pt-2 text-[10px] font-bold uppercase text-muted-foreground">
                    {hour}
                  </div>
                ))}
              </div>

              {weekDays.map((day) => {
                const dateKey = getDateKeyInTimeZone(day, timezone)
                const openTimes = availableTimesByDate.get(dateKey) ?? new Set<string>()
                return (
                  <div key={dateKey} className="flex-1 border-r border-border last:border-0">
                    {timeSlots.map((hour) => {
                      const booking = bookings.find((entry) => entry.date === dateKey && entry.time === hour)
                      return (
                        <TimeSlot
                          key={`${dateKey}-${hour}`}
                          time={hour}
                          booking={booking}
                          isAvailable={openTimes.has(hour)}
                          onClick={(time) => {
                            if (booking) {
                              onBookingClick?.(booking)
                            } else {
                              onSlotClick(dateKey, time)
                            }
                          }}
                          isNow={nowInTimeZone.date === dateKey && `${nowInTimeZone.time.slice(0, 2)}:00` === hour}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 border-b border-border">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="border-r border-border py-3 text-center text-xs font-bold uppercase text-muted-foreground last:border-0">
                {day}
              </div>
            ))}

            {paddingDays.map((day) => (
              <div
                key={`padding-${day.toString()}`}
                className="min-h-[120px] border-r border-b border-border bg-muted/10 p-2 opacity-30 last:border-r-0"
              >
                <p className="text-sm font-bold text-muted-foreground/50">{formatDisplayDate(day, timezone, { day: 'numeric' })}</p>
              </div>
            ))}

            {monthDays.map((day) => {
              const dateKey = getDateKeyInTimeZone(day, timezone)
              const dayBookings = bookings.filter((booking) => booking.date === dateKey)
              const openTimes = availableTimesByDate.get(dateKey) ?? new Set<string>()
              return (
                <div
                  key={dateKey}
                  className="group min-h-[120px] border-r border-b border-border p-2 transition-colors hover:bg-muted/30 last:border-r-0"
                >
                  <p className={cn('flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold', nowInTimeZone.date === dateKey && 'bg-primary text-primary-foreground')}>
                    {formatDisplayDate(day, timezone, { day: 'numeric' })}
                  </p>
                  <div className="mt-2 space-y-1">
                     {dayBookings.length > 0 ? (
                      dayBookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="truncate rounded bg-primary/10 p-1 text-[10px] font-medium text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={() => onBookingClick?.(booking)}
                        >
                          {booking.time} {booking.clientName}
                        </div>
                      ))
                    ) : openTimes.size > 0 ? (
                      <div className="flex h-full items-center justify-center pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 rounded-full p-0"
                          onClick={() => onSlotClick(dateKey, [...openTimes][0] ?? '09:00')}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className="pt-4 text-[10px] uppercase text-muted-foreground">Unavailable</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
