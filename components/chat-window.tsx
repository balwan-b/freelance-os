'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './message-bubble'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Paperclip, MoreHorizontal, Phone, Video } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Message {
  id: string
  content: string
  timestamp: string
  isSent: boolean
}

interface ChatWindowProps {
  clientName: string
  clientAvatar?: string
  messages: Message[]
  onSendMessage: (content: string) => void
}

export function ChatWindow({ clientName, clientAvatar, messages, onSendMessage }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-r-xl overflow-hidden shadow-2xl border-l border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border ring-2 ring-background">
            {clientAvatar && <AvatarImage src={clientAvatar} />}
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold uppercase tracking-wider">
              {clientName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-foreground leading-tight">{clientName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-muted/5 to-transparent"
      >
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            content={msg.content} 
            timestamp={msg.timestamp} 
            isSent={msg.isSent} 
          />
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" type="button" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative group">
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="pr-12 h-11 bg-background border-border/50 focus:border-primary/50 transition-all rounded-xl shadow-inner"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!inputValue.trim()}
              className="absolute right-1 top-1 h-9 w-9 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-90 disabled:opacity-30 disabled:scale-100"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
