'use client'

import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export interface Inquiry {
  id: string
  name: string
  service: string
  date: Date
  tags: string[]
  budget?: string
  email?: string
  phone?: string
  notes?: string
}

interface InquiryCardProps {
  inquiry: Inquiry
  onClick: (inquiry: Inquiry) => void
}

export function InquiryCard({ inquiry, onClick }: InquiryCardProps) {
  return (
    <div
      onClick={() => onClick(inquiry)}
      className="p-4 border border-border rounded-lg bg-card hover:bg-muted hover:border-border/60 transition-all cursor-pointer group"
      role="button"
      tabIndex={0}
    >
      <div className="space-y-2">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-sm group-hover:text-foreground">{inquiry.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{inquiry.service}</p>
        </div>

        {/* Date */}
        <p className="text-xs text-muted-foreground">
          {format(new Date(inquiry.date), 'MMM d, yyyy')}
        </p>

        {/* Tags */}
        {inquiry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {inquiry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
