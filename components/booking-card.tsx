import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Calendar, Video, Briefcase, XCircle, CheckCircle, Check, CalendarDays, X, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'
export type BookingType = 'call' | 'session' | 'project'

interface BookingCardProps {
  id: string
  clientName: string
  date: string
  time: string
  status: BookingStatus
  type: BookingType
  onStatusChange?: (id: string, newStatus: BookingStatus) => void
  onReschedule?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

const statusConfig = {
  upcoming: { 
    bg: 'bg-blue-50/50 dark:bg-blue-950/30', 
    text: 'text-blue-700 dark:text-blue-300', 
    border: 'border-blue-100 dark:border-blue-900',
    icon: Clock,
    label: 'Upcoming' 
  },
  completed: { 
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/30', 
    text: 'text-emerald-700 dark:text-emerald-300', 
    border: 'border-emerald-100 dark:border-emerald-900',
    icon: CheckCircle,
    label: 'Completed' 
  },
  cancelled: { 
    bg: 'bg-rose-50/50 dark:bg-rose-950/30', 
    text: 'text-rose-700 dark:text-rose-300', 
    border: 'border-rose-100 dark:border-rose-900',
    icon: XCircle,
    label: 'Cancelled' 
  },
}

const typeConfig = {
  call: { icon: Video, label: 'Call' },
  session: { icon: Calendar, label: 'Session' },
  project: { icon: Briefcase, label: 'Project' },
}

export function BookingCard({ id, clientName, date, time, status, type, onStatusChange, onReschedule, onEdit, onDelete }: BookingCardProps) {
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming
  const typeInfo = typeConfig[type as keyof typeof typeConfig] || typeConfig.project
  const StatusIcon = statusInfo.icon
  const TypeIcon = typeInfo.icon

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md border ${statusInfo.border} ${statusInfo.bg}`}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-semibold text-base text-foreground leading-tight">{clientName}</h4>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TypeIcon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium uppercase tracking-wider">{typeInfo.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusInfo.text} border-current/20`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusInfo.label}
              </Badge>
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(id)}>
                        <Pencil className="w-3.5 h-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => onDelete(id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-current/5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="p-1.5 rounded-md bg-background/50 border border-border">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-foreground/80">{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="p-1.5 rounded-md bg-background/50 border border-border">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-foreground/80">{time}</span>
            </div>
          </div>
        </div>
      </CardContent>
      {status === 'upcoming' && (
        <CardFooter className="p-3 pt-0 border-t border-current/5 flex items-center justify-between gap-2 bg-background/50">
          <div className="flex gap-2">
            {onStatusChange && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                onClick={() => onStatusChange(id, 'completed')}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Done
              </Button>
            )}
            {onReschedule && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                onClick={() => onReschedule(id)}
              >
                <CalendarDays className="w-3.5 h-3.5 mr-1" />
                Reschedule
              </Button>
            )}
          </div>
          {onStatusChange && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => onStatusChange(id, 'cancelled')}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
