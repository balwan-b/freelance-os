'use client'

import { Inquiry } from '@/components/inquiry-card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Mail, Phone, DollarSign, Pencil, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InquiryDrawerProps {
  inquiry: Inquiry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  stage?: 'new' | 'contacted' | 'qualified' | 'rejected'
  onStageChange?: (stage: 'new' | 'contacted' | 'qualified' | 'rejected') => void
  onConvert?: () => void
  onSchedule?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function InquiryDrawer({
  inquiry,
  open,
  onOpenChange,
  stage,
  onStageChange,
  onConvert,
  onSchedule,
  onEdit,
  onDelete,
}: InquiryDrawerProps) {
  if (!inquiry) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>{inquiry.name}</SheetTitle>
          <SheetDescription>{inquiry.service}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{inquiry.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{inquiry.phone || 'No phone provided'}</span>
              </div>
              {inquiry.budget && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>{inquiry.budget} budget</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs">Received: {format(new Date(inquiry.date), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {onStageChange && stage && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Stage</h3>
              <Select value={stage} onValueChange={(value) => onStageChange(value as typeof stage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {inquiry.tags.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {inquiry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {inquiry.notes && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{inquiry.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-border px-6 py-4 space-y-2">
          {onEdit ? (
            <Button variant="outline" className="w-full" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Inquiry
            </Button>
          ) : null}
          <Button className="w-full" onClick={onConvert}>
            Convert to Client
          </Button>
          <Button variant="outline" className="w-full" onClick={onSchedule}>
            Schedule Booking
          </Button>
          {onDelete ? (
            <Button variant="outline" className="w-full text-destructive" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Inquiry
            </Button>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
