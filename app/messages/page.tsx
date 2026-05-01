'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { ConversationList } from '@/components/conversation-list'
import { ChatWindow } from '@/components/chat-window'
import { MessageCircle } from 'lucide-react'

interface Message {
  id: string
  content: string
  timestamp: string
  isSent: boolean
}

const mockConversations = [
  {
    id: '1',
    name: 'TechStart Inc',
    lastMessage: "I've reviewed the latest design, looks great!",
    timestamp: '2m ago',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'Digital Solutions',
    lastMessage: 'Can we schedule a quick call tomorrow?',
    timestamp: '1h ago',
  },
  {
    id: '3',
    name: 'Creative Agency',
    lastMessage: 'The logo files have been uploaded.',
    timestamp: '3h ago',
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    lastMessage: 'Thank you for your help!',
    timestamp: 'Yesterday',
  },
]

const mockMessagesByConversation: Record<string, Message[]> = {
  '1': [
    { id: '1', content: "Hi! How's the progress on the website redesign?", timestamp: '10:00 AM', isSent: false },
    { id: '2', content: "It's going well! I've finished the homepage mockups.", timestamp: '10:05 AM', isSent: true },
    { id: '3', content: "Great! Can you share them with me?", timestamp: '10:06 AM', isSent: false },
    { id: '4', content: "I've reviewed the latest design, looks great!", timestamp: '10:30 AM', isSent: false },
  ],
  '2': [
    { id: '1', content: 'Hey, do you have time for a quick chat?', timestamp: 'Yesterday', isSent: false },
    { id: '2', content: 'Sure, what is on your mind?', timestamp: 'Yesterday', isSent: true },
    { id: '3', content: 'Can we schedule a quick call tomorrow?', timestamp: '1h ago', isSent: false },
  ],
  '3': [
    { id: '1', content: 'Logo files are ready.', timestamp: '4h ago', isSent: true },
    { id: '2', content: 'The logo files have been uploaded.', timestamp: '3h ago', isSent: false },
  ],
  '4': [
    { id: '1', content: 'Project completed successfully.', timestamp: 'Yesterday', isSent: true },
    { id: '2', content: 'Thank you for your help!', timestamp: 'Yesterday', isSent: false },
  ],
}

export default function MessagesPage() {
  const [selectedConvId, setSelectedConvId] = useState('1')
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessagesByConversation)

  const activeConv = mockConversations.find(c => c.id === selectedConvId) || mockConversations[0]

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      timestamp: 'Just now',
      isSent: true,
    }
    
    setMessages(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMessage]
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 h-full flex flex-col">
        {/* Header */}
        <PageHeader 
          title="Messages"
          description="Stay connected with your clients and leads."
        />

        {mockConversations.length > 0 ? (
          <div className="flex flex-1 min-h-0 border border-border rounded-xl overflow-hidden shadow-sm bg-card/30 backdrop-blur-md">
            {/* Left: Conversation List */}
            <div className="w-80 shrink-0 border-r border-border">
              <ConversationList 
                conversations={mockConversations} 
                selectedId={selectedConvId}
                onSelect={setSelectedConvId}
              />
            </div>

            {/* Right: Chat Window */}
            <div className="flex-1 min-w-0">
              <ChatWindow 
                clientName={activeConv.name}
                messages={messages[selectedConvId] || []}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-2xl border border-dashed border-border">
            <div className="p-6 rounded-full bg-muted mb-4">
              <MessageCircle className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold">No messages yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              When clients message you about inquiries or bookings, they will appear here.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
