'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: Date
  selectedTime?: string
  clients?: Array<{ id: string; name: string }>
  defaultClientId?: string
  defaultClientName?: string
  onSubmit?: (values: {
    clientId?: string
    clientName?: string
    date: string
    startTime: string
    type: 'call' | 'session' | 'project'
  }) => Promise<void> | void
}

export function BookingModal({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  clients = [],
  defaultClientId,
  defaultClientName,
  onSubmit,
}: BookingModalProps) {
  const [clientValue, setClientValue] = useState(defaultClientId ?? '')
  const [clientName, setClientName] = useState(defaultClientName ?? '')
  const [dateValue, setDateValue] = useState('')
  const [timeValue, setTimeValue] = useState('')
  const [typeValue, setTypeValue] = useState<'call' | 'session' | 'project'>('call')

  useEffect(() => {
    if (!isOpen) return
    setClientValue(defaultClientId ?? '')
    setClientName(defaultClientName ?? '')
    setDateValue(selectedDate ? selectedDate.toISOString().split('T')[0] : '')
    setTimeValue(selectedTime || '')
    setTypeValue('call')
  }, [defaultClientId, defaultClientName, isOpen, selectedDate, selectedTime])

  async function handleSubmit() {
    if (!onSubmit) {
      onClose()
      return
    }
    await onSubmit({
      clientId: clientValue || undefined,
      clientName: clientName.trim() || undefined,
      date: dateValue,
      startTime: timeValue,
      type: typeValue,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Schedule a new session or call with a client.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            {clients.length > 0 && (
              <Select value={clientValue} onValueChange={setClientValue}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Choose an existing client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input
              id="client-name"
              placeholder="Or type a new client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Booking Type</Label>
            <Select value={typeValue} onValueChange={(value) => setTypeValue(value as 'call' | 'session' | 'project')}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="session">Session</SelectItem>
                <SelectItem value="project">Project Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!dateValue || !timeValue || (!clientValue && !clientName.trim())}>
            Create Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
