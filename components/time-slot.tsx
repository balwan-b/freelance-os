'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface TimeSlotProps {
  time: string
  booking?: {
    id: string
    clientName: string
    type: string
  }
  isAvailable?: boolean
  onClick: (time: string) => void
  isNow?: boolean
}

export function TimeSlot({ time, booking, isAvailable = true, onClick, isNow }: TimeSlotProps) {
  return (
    <div 
      onClick={() => !booking && isAvailable && onClick(time)}
      className={cn(
        "group relative h-20 border-b border-border/50 transition-colors cursor-pointer",
        !booking && isAvailable && "hover:bg-muted/50",
        !booking && !isAvailable && "cursor-not-allowed bg-muted/20",
        isNow && "bg-primary/5"
      )}
    >
      {/* Time Indicator (optional, usually handled by the grid layout) */}
      
      {booking ? (
        <div className="absolute inset-1 rounded-md bg-primary/10 border-l-4 border-primary p-2 flex flex-col justify-center overflow-hidden">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary truncate">
            {booking.type}
          </p>
          <p className="text-xs font-semibold text-foreground truncate">
            {booking.clientName}
          </p>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-medium text-muted-foreground uppercase">
            {isAvailable ? 'Book Slot' : 'Unavailable'}
          </span>
        </div>
      )}
    </div>
  )
}
