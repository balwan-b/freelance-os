'use client'

import { useEffect, useState } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Users, Calendar, CheckSquare2, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CommandPaletteProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandPalette({ open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen
  const router = useRouter()

  const commandItems = [
    {
      group: 'Quick Actions',
      items: [
        {
          id: 'add-inquiry',
          label: 'Add New Inquiry',
          description: 'Open the live inquiries pipeline',
          icon: MessageSquare,
          action: () => router.push('/inquiries'),
        },
        {
          id: 'add-client',
          label: 'Add Client',
          description: 'Open the live client list',
          icon: Users,
          action: () => router.push('/clients'),
        },
        {
          id: 'create-booking',
          label: 'Create Booking',
          description: 'Open bookings and schedule work',
          icon: Calendar,
          action: () => router.push('/bookings'),
        },
        {
          id: 'add-task',
          label: 'Add Task',
          description: 'Jump to your task manager',
          icon: CheckSquare2,
          action: () => router.push('/tasks'),
        },
      ],
    },
  ]

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

  const handleSelect = (action: () => void) => {
    action()
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commandItems.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.action)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
