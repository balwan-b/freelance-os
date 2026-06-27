'use client'

import React, { useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel'
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
import { formatTimeZoneLabel } from '@/lib/timezone'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate?: string
  selectedTime?: string
  clients?: Array<{ id: Id<'clients'>; name: string }>
  defaultClientId?: Id<'clients'>
  defaultClientName?: string
  timezone?: string
  availableTimes?: string[]
  initialData?: {
    id: Id<'bookings'>
    clientId?: Id<'clients'>
    clientName?: string
    date: string
    startTime: string
    type: 'call' | 'session' | 'project'
  }
  onSubmit?: (values: {
    id?: Id<'bookings'>
    clientId?: Id<'clients'>
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
  timezone = 'UTC',
  availableTimes,
  initialData,
  onSubmit,
}: BookingModalProps) {
  const [clientValue, setClientValue] = useState<string>(initialData?.clientId ?? '')
  const [clientName, setClientName] = useState(initialData?.clientName ?? '')
  const [dateValue, setDateValue] = useState(initialData?.date ?? '')
  const [timeValue, setTimeValue] = useState(initialData?.startTime ?? '')
  const [typeValue, setTypeValue] = useState<'call' | 'session' | 'project'>(initialData?.type ?? 'call')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveClientValue = clientValue || defaultClientId || ''
  const effectiveClientName = clientName || defaultClientName || ''
  const effectiveDateValue = dateValue || selectedDate || ''
  const effectiveTimeValue = timeValue || selectedTime || ''

  const timeOptions = availableTimes && availableTimes.length > 0
    ? availableTimes
    : ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  function handleOpenChange(open: boolean) {
    if (!open) {
      setClientValue(initialData?.clientId ?? '')
      setClientName(initialData?.clientName ?? '')
      setDateValue(initialData?.date ?? '')
      setTimeValue(initialData?.startTime ?? '')
      setTypeValue(initialData?.type ?? 'call')
      setSubmitting(false)
      setError(null)
      onClose()
    }
    // No need for else since useEffect handles the open state pre-fill if we wanted it
    // but here we use simple state and a key change usually works best in React.
  }

  // React to initialData changes when the modal is open
  React.useEffect(() => {
    if (isOpen) {
      setClientValue(initialData?.clientId ?? '')
      setClientName(initialData?.clientName ?? '')
      setDateValue(initialData?.date ?? '')
      setTimeValue(initialData?.startTime ?? '')
      setTypeValue(initialData?.type ?? 'call')
    }
  }, [isOpen, initialData])

  async function handleSubmit() {
    if (!onSubmit) {
      handleOpenChange(false)
      return
    }
    try {
      setSubmitting(true)
      setError(null)
      await onSubmit({
        id: initialData?.id,
        clientId: (effectiveClientValue || defaultClientId || undefined) as Id<'clients'> | undefined,
        clientName: effectiveClientName.trim() || undefined,
        date: effectiveDateValue,
        startTime: effectiveTimeValue,
        type: typeValue,
      })
      handleOpenChange(false)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Booking could not be created.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Booking' : 'New Booking'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this booking.' : 'Schedule a new session or call with a client.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Times are scheduled in {formatTimeZoneLabel(timezone)}.
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client">Client</Label>
            {clients.length > 0 && (
              <Select value={effectiveClientValue} onValueChange={setClientValue}>
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
              value={effectiveClientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={effectiveDateValue}
                onChange={(e) => setDateValue(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Select value={effectiveTimeValue} onValueChange={setTimeValue}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!effectiveDateValue || !effectiveTimeValue || (!effectiveClientValue && !effectiveClientName.trim()) || submitting}
          >
            {submitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Booking')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
