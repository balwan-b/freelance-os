'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Conversation {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-card border-r border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold tracking-tight">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-center gap-3 p-4 transition-all hover:bg-muted/50 border-b border-border/50 text-left",
              selectedId === conv.id && "bg-muted border-r-2 border-r-primary"
            )}
          >
            <Avatar className="h-10 w-10 border border-border">
              {conv.avatar && <AvatarImage src={conv.avatar} />}
              <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                {conv.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold truncate text-foreground">{conv.name}</p>
                <span className="text-[10px] text-muted-foreground font-bold uppercase whitespace-nowrap">
                  {conv.timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate leading-relaxed">
                {conv.lastMessage}
              </p>
            </div>
            {conv.unreadCount ? (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-[10px] font-bold text-primary-foreground">{conv.unreadCount}</span>
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
