'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, FilterX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookingStatus } from './booking-card'

interface FilterBarProps {
  onStatusChange: (status: BookingStatus | 'all') => void
  onDateChange: (date: Date | undefined) => void
  onClearFilters: () => void
  currentStatus: BookingStatus | 'all'
  currentDate: Date | undefined
}

export function FilterBar({
  onStatusChange,
  onDateChange,
  onClearFilters,
  currentStatus,
  currentDate,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Status</span>
        <Select value={currentStatus} onValueChange={(value) => onStatusChange(value as BookingStatus | 'all')}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Date</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[200px] justify-start text-left font-normal bg-background",
                !currentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {currentDate ? format(currentDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {(currentStatus !== 'all' || currentDate) && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground h-9"
        >
          <FilterX className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
