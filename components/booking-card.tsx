import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, Phone, Video, Briefcase, XCircle, CheckCircle } from 'lucide-react'

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled'
export type BookingType = 'call' | 'session' | 'project'

interface BookingCardProps {
  id: string
  clientName: string
  date: string
  time: string
  status: BookingStatus
  type: BookingType
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

export function BookingCard({ clientName, date, time, status, type }: BookingCardProps) {
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
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusInfo.text} border-current/20`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </Badge>
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
    </Card>
  )
}
