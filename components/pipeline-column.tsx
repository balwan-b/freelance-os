'use client'

import { Inquiry, InquiryCard } from '@/components/inquiry-card'
import { Plus } from 'lucide-react'

interface PipelineColumnProps {
  title: string
  count: number
  inquiries: Inquiry[]
  onCardClick: (inquiry: Inquiry) => void
  color?: 'blue' | 'purple' | 'amber' | 'slate'
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-950/30',
  purple: 'bg-purple-50 dark:bg-purple-950/30',
  amber: 'bg-amber-50 dark:bg-amber-950/30',
  slate: 'bg-slate-50 dark:bg-slate-900/30',
}

export function PipelineColumn({
  title,
  count,
  inquiries,
  onCardClick,
  color = 'blue',
}: PipelineColumnProps) {
  return (
    <div className="flex flex-col h-full rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b border-border ${colorClasses[color]} flex items-center justify-between`}>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{count} inquiry(ies)</p>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <InquiryCard key={inquiry.id} inquiry={inquiry} onClick={onCardClick} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px] text-center p-6 border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
            <div className="p-3 rounded-full bg-muted/50 mb-3">
              <Plus className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No inquiries yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1 truncate">New leads will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
