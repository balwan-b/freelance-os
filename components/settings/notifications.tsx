'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface NotificationSettingsProps {
  notifications?: {
    emailBookings: boolean
    pushBookings: boolean
    smsBookings: boolean
    newMessages: boolean
    projectReminders: boolean
  }
}

export function NotificationSettings({ notifications }: NotificationSettingsProps) {
  const updateNotifications = useMutation(api.settings.updateNotifications)
  const [prefs, setPrefs] = useState({
    emailBookings: true,
    pushBookings: true,
    smsBookings: false,
    newMessages: true,
    projectReminders: true,
  })

  useEffect(() => {
    if (notifications) {
      setPrefs(notifications)
    }
  }, [notifications])

  const sections = [
    {
      title: 'Booking Alerts',
      description: 'How you receive updates about your bookings.',
      items: [
        { icon: Mail, label: 'Email Notifications', key: 'emailBookings', description: 'New bookings, reschedules, and cancellations.' },
        { icon: Bell, label: 'Push Notifications', key: 'pushBookings', description: 'Direct alerts on your browser or app.' },
        { icon: Smartphone, label: 'SMS Alerts', key: 'smsBookings', description: 'Urgent updates directly to your phone.' },
      ]
    },
    {
      title: 'Activity Updates',
      description: 'Stay updated on platform and client activity.',
      items: [
        { icon: MessageSquare, label: 'New Messages', key: 'newMessages', description: 'Receive alerts when a client sends a message.' },
        { icon: Smartphone, label: 'Project Reminders', key: 'projectReminders', description: 'Automatic reminders for upcoming deadlines.' },
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => (
        <Card key={idx} className="border-border bg-card">
          <CardHeader>
            <h3 className="text-xl font-bold">{section.title}</h3>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-muted/10 transition-colors hover:bg-muted/20">
                  <div className="flex gap-4">
                    <div className="p-2 rounded-lg bg-primary/5 text-primary h-fit">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-bold uppercase tracking-wider">{item.label}</Label>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs[item.key as keyof typeof prefs]}
                    onCheckedChange={(checked) =>
                      setPrefs((prev) => ({
                        ...prev,
                        [item.key]: Boolean(checked),
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button onClick={() => updateNotifications({ notifications: prefs })}>Save Preferences</Button>
      </div>
    </div>
  )
}
