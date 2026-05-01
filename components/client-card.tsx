'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Clock, BookOpen } from 'lucide-react'

export interface Client {
  id: string
  name: string
  status: 'active' | 'inactive' | 'archived'
  totalBookings: number
  lastInteraction: string
  initials: string
}

interface ClientCardProps extends Client {
  onClick?: () => void
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

export function ClientCard({ id, name, status, totalBookings, lastInteraction, initials, onClick }: ClientCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border border-border"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with Avatar and Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{name}</h3>
              </div>
            </div>
            <Badge className={statusColors[status]}>
              {statusLabels[status]}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Bookings
              </p>
              <p className="text-lg font-semibold">{totalBookings}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last Interaction
              </p>
              <p className="text-sm font-medium">{lastInteraction}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
