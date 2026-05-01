'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  content: string
  timestamp: string
  isSent: boolean
}

export function MessageBubble({ content, timestamp, isSent }: MessageBubbleProps) {
  return (
    <div className={cn(
      "flex flex-col gap-1 max-w-[80%]",
      isSent ? "items-end self-end" : "items-start self-start"
    )}>
      <div className={cn(
        "px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all",
        isSent 
          ? "bg-primary text-primary-foreground rounded-tr-none" 
          : "bg-muted text-foreground rounded-tl-none"
      )}>
        {content}
      </div>
      <span className="text-[10px] text-muted-foreground px-1 uppercase font-bold tracking-tighter">
        {timestamp}
      </span>
    </div>
  )
}
