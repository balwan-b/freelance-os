'use client'

import { useMemo, useState } from 'react'
import type { Id } from '@/convex/_generated/dataModel'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { PipelineColumn } from '@/components/pipeline-column'
import { InquiryDrawer } from '@/components/inquiry-drawer'
import { Inquiry } from '@/components/inquiry-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { InquiryFormDialog } from '@/components/inquiry-form-dialog'
import { BookingModal } from '@/components/booking-modal'
import { useCurrentUser } from '@/hooks/use-current-user'

type InquiryStage = 'new' | 'contacted' | 'qualified' | 'rejected'

const stageColor: Record<InquiryStage, 'blue' | 'purple' | 'amber' | 'slate'> = {
  new: 'blue',
  contacted: 'purple',
  qualified: 'amber',
  rejected: 'slate',
}

const stageTitle: Record<InquiryStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  rejected: 'Rejected',
}

type InquiryRecord = {
  _id: string
  name: string
  service: string
  receivedOn: string
  tags: string[]
  budget?: string
  email?: string
  phone?: string
  notes?: string
}

function toInquiry(row: InquiryRecord): Inquiry {
  return {
    id: row._id,
    name: row.name,
    service: row.service,
    date: new Date(row.receivedOn),
    tags: row.tags,
    budget: row.budget,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
  }
}

export default function InquiriesPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const inquiryGroups = useQuery(api.inquiries.list, currentUser ? {} : 'skip')
  const createInquiry = useMutation(api.inquiries.create)
  const updateInquiry = useMutation(api.inquiries.update)
  const updateStage = useMutation(api.inquiries.updateStage)
  const removeInquiry = useMutation(api.inquiries.remove)
  const convertToClient = useMutation(api.inquiries.convertToClient)
  const createBooking = useMutation(api.bookings.create)

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [selectedStage, setSelectedStage] = useState<InquiryStage>('new')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null)

  const columns = useMemo(() => {
    if (!inquiryGroups) return []
    return (['new', 'contacted', 'qualified', 'rejected'] as InquiryStage[]).map((stage) => ({
      stage,
      inquiries: (inquiryGroups[stage] ?? []).map(toInquiry),
    }))
  }, [inquiryGroups])

  const handleCardClick = (stage: InquiryStage, inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    setSelectedStage(stage)
    setDrawerOpen(true)
  }

  if (isLoading || currentUser === null || inquiryGroups === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading inquiries...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Inquiries Pipeline"
          description="Manage and track all incoming project inquiries"
          action={
            <Button size="sm" className="gap-2 hidden sm:flex" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              New Inquiry
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-240px)]">
          {columns.map((column) => (
            <PipelineColumn
              key={column.stage}
              title={stageTitle[column.stage]}
              count={column.inquiries.length}
              inquiries={column.inquiries}
              onCardClick={(inquiry) => handleCardClick(column.stage, inquiry)}
              color={stageColor[column.stage]}
            />
          ))}
        </div>
      </div>

      <InquiryDrawer
        inquiry={selectedInquiry}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        stage={selectedStage}
        onStageChange={async (stage) => {
          if (!selectedInquiry) return
          setSelectedStage(stage)
          await updateStage({ inquiryId: selectedInquiry.id as Id<'inquiries'>, stage })
        }}
        onConvert={async () => {
          if (!selectedInquiry) return
          await convertToClient({ inquiryId: selectedInquiry.id as Id<'inquiries'> })
          setDrawerOpen(false)
        }}
        onSchedule={() => setBookingOpen(true)}
        onEdit={() => setEditingInquiry(selectedInquiry)}
        onDelete={async () => {
          if (!selectedInquiry) return
          if (!window.confirm(`Delete ${selectedInquiry.name}?`)) return
          await removeInquiry({ inquiryId: selectedInquiry.id as Id<'inquiries'> })
          setDrawerOpen(false)
          setSelectedInquiry(null)
        }}
      />

      <InquiryFormDialog
        key="create-inquiry"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          await createInquiry(values);
        }}
      />

      <InquiryFormDialog
        key={editingInquiry?.id ?? 'edit-inquiry'}
        open={Boolean(editingInquiry)}
        onOpenChange={(open) => {
          if (!open) setEditingInquiry(null)
        }}
        title="Edit Inquiry"
        description="Update the lead details and context."
        initialData={editingInquiry ? {
          name: editingInquiry.name,
          service: editingInquiry.service,
          email: editingInquiry.email,
          phone: editingInquiry.phone,
          budget: editingInquiry.budget,
          notes: editingInquiry.notes,
          tags: editingInquiry.tags,
        } : undefined}
        onSubmit={async (values) => {
          if (editingInquiry) {
            await updateInquiry({ inquiryId: editingInquiry.id as Id<'inquiries'>, ...values });
          }
        }}
      />

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        defaultClientName={selectedInquiry?.name}
        onSubmit={async (values) => {
          await createBooking({
            inquiryId: selectedInquiry?.id as Id<'inquiries'> | undefined,
            clientId: values.clientId,
            clientName: values.clientName,
            date: values.date,
            startTime: values.startTime,
            type: values.type,
          })
        }}
      />
    </DashboardLayout>
  )
}
