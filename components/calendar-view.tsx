'use client'

import React, { useState } from 'react'
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeSlot } from './time-slot'
import { cn } from '@/lib/utils'

interface Booking {
  id: string
  clientName: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  type: string
}

interface CalendarViewProps {
  bookings: Booking[]
  onSlotClick: (date: Date, time: string) => void
}

const HOURS = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`) // 8 AM to 7 PM

export function CalendarView({ bookings, onSlotClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Calculate padding days for the start of the month
  const firstDayOfMonth = startOfWeek(monthStart, { weekStartsOn: 1 })
  const paddingDaysCount = Math.floor((monthStart.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24))
  const paddingDays = Array.from({ length: paddingDaysCount }, (_, i) => addDays(firstDayOfMonth, i))

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
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-border gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold min-w-[150px]">
            {format(currentDate, viewMode === 'week' ? 'MMMM yyyy' : 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
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

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month')}>
          <TabsList className="bg-muted">
            <TabsTrigger value="week" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Week
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'week' ? (
          <div className="flex flex-col min-w-[800px]">
            {/* Week Header */}
            <div className="flex border-b border-border sticky top-0 bg-card z-10">
              <div className="w-20 border-r border-border" />
              {weekDays.map((day) => (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "flex-1 py-3 text-center border-r border-border last:border-0",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{format(day, 'EEE')}</p>
                  <p className={cn(
                    "text-lg font-bold mt-1",
                    isToday(day) && "text-primary"
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Week Body */}
            <div className="flex relative">
              {/* Time Labels */}
              <div className="w-20 border-r border-border bg-muted/20">
                {HOURS.map((hour) => (
                  <div key={hour} className="h-20 flex items-start justify-center pt-2 text-[10px] font-bold text-muted-foreground uppercase">
                    {hour}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => (
                <div key={day.toString()} className="flex-1 border-r border-border last:border-0">
                  {HOURS.map((hour) => {
                    const booking = bookings.find(b => 
                      b.date === format(day, 'yyyy-MM-dd') && b.time === hour
                    )
                    return (
                      <TimeSlot 
                        key={hour} 
                        time={hour} 
                        booking={booking}
                        onClick={(h) => onSlotClick(day, h)}
                        isNow={isToday(day) && format(new Date(), 'H:00') === hour}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 border-b border-border">
            {/* Month Header */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase border-r border-border last:border-0">
                {day}
              </div>
            ))}
            
            {/* Padding Days */}
            {paddingDays.map(day => (
              <div 
                key={`padding-${day.toString()}`} 
                className="min-h-[120px] p-2 border-r border-b border-border last:border-r-0 opacity-30 bg-muted/10"
              >
                <p className="text-sm font-bold text-muted-foreground/50">
                  {format(day, 'd')}
                </p>
              </div>
            ))}

            {/* Month Days */}
            {monthDays.map((day) => {
              const dayBookings = bookings.filter(b => b.date === format(day, 'yyyy-MM-dd'))
              return (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b border-border last:border-r-0 transition-colors hover:bg-muted/30",
                    !isSameDay(day, currentDate) && "text-muted-foreground"
                  )}
                >
                  <p className={cn(
                    "text-sm font-bold h-6 w-6 flex items-center justify-center rounded-full",
                    isToday(day) && "bg-primary text-primary-foreground"
                  )}>
                    {format(day, 'd')}
                  </p>
                  <div className="mt-2 space-y-1">
                    {dayBookings.length > 0 ? (
                      dayBookings.map(b => (
                        <div key={b.id} className="text-[10px] p-1 rounded bg-primary/10 text-primary truncate font-medium">
                          {b.time} {b.clientName}
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 rounded-full"
                          onClick={() => onSlotClick(day, '09:00')}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
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
