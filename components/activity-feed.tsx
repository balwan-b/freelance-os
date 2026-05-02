import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MessageSquare, UserPlus, CheckCircle } from 'lucide-react'

interface Activity {
  id?: string
  _id?: string
  type: 'booking' | 'client' | 'message' | 'completion'
  title: string
  description: string
  time: string
  icon?: React.ReactNode
}

interface ActivityFeedProps {
  activities: Activity[]
}

const typeConfig = {
  booking: {
    icon: Calendar,
    color: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
  client: {
    icon: UserPlus,
    color: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-700 dark:text-green-300',
  },
  message: {
    icon: MessageSquare,
    color: 'bg-purple-100 dark:bg-purple-900',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  completion: {
    icon: CheckCircle,
    color: 'bg-emerald-100 dark:bg-emerald-900',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <CardDescription>Your latest interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = typeConfig[activity.type]
            const Icon = config.icon
            const key = activity._id || activity.id || index

            return (
              <div key={key} className="flex gap-4">
                <div className={`mt-1 p-2 rounded-lg ${config.color}`}>
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
