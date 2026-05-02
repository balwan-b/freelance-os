import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckSquare2, FileText, MessageSquare } from 'lucide-react'

export type TimelineEvent = {
  id: string
  type: 'booking' | 'task' | 'note' | 'message'
  date: Date
  title: string
  description?: string
  status?: string
}

interface ActivityTimelineProps {
  events: TimelineEvent[]
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime())

  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-500" />
      case 'task':
        return <CheckSquare2 className="w-4 h-4 text-green-500" />
      case 'note':
        return <FileText className="w-4 h-4 text-orange-500" />
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-500" />
    }
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length > 0 ? (
          <div className="relative border-l border-border ml-3 space-y-6">
            {sortedEvents.map((event) => (
              <div key={event.id} className="relative pl-6">
                <div className="absolute -left-3.5 top-1 bg-background border border-border rounded-full p-1.5 shadow-sm">
                  {getIcon(event.type)}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                  <span className="font-medium text-sm">{event.title}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {event.date.toLocaleDateString()} {event.date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                {event.status && (
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                    {event.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No activity yet.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
