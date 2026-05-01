import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string
  description: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

export function StatCard({ title, description, value, icon, trend }: StatCardProps) {
  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>{' '}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
