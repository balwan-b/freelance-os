'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { ClientCard } from '@/components/client-card'
import { ClientTableRow } from '@/components/client-table-row'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Plus, LayoutGrid, LayoutList } from 'lucide-react'
import { ButtonGroup } from '@/components/ui/button-group'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ClientFormDialog } from '@/components/client-form-dialog'
import { useCurrentUser } from '@/hooks/use-current-user'

type ViewType = 'grid' | 'table'

function toRelativeLabel(dateString?: string) {
  if (!dateString) return 'No recent activity'
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return `${Math.max(hours, 1)} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function ClientsPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all')
  const [viewType, setViewType] = useState<ViewType>('grid')
  const [createOpen, setCreateOpen] = useState(false)
  const router = useRouter()
  const createClient = useMutation(api.clients.create)
  const clients = useQuery(api.clients.list, currentUser ? {
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
  } : 'skip')

  if (isLoading || currentUser === null || clients === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading clients...</div>
      </DashboardLayout>
    )
  }

  const activeCount = clients.filter((c: any) => c.status === 'active').length
  const inactiveCount = clients.filter((c: any) => c.status === 'inactive').length
  const archivedCount = clients.filter((c: any) => c.status === 'archived').length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Clients"
          description="Manage and track all your client relationships"
          action={
            <Button size="sm" className="gap-2 hidden sm:flex" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          }
        />

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active ({activeCount})</SelectItem>
                <SelectItem value="inactive">Inactive ({inactiveCount})</SelectItem>
                <SelectItem value="archived">Archived ({archivedCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ButtonGroup className="w-full sm:w-auto">
            <Button
              variant={viewType === 'grid' ? 'default' : 'outline'}
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => setViewType('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewType === 'table' ? 'default' : 'outline'}
              className="gap-2 flex-1 sm:flex-none"
              onClick={() => setViewType('table')}
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </ButtonGroup>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {clients.length} client(s)
        </div>

        {viewType === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client: any) => (
              <ClientCard
                key={client._id}
                id={client._id}
                name={client.name}
                status={client.status}
                totalBookings={client.totalBookings}
                lastInteraction={toRelativeLabel(client.lastInteractionDate)}
                initials={client.initials}
                onClick={() => router.push(`/clients/${client._id}`)}
              />
            ))}
          </div>
        )}

        {viewType === 'table' && (
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Last Interaction</TableHead>
                  <TableHead className="text-right w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client: any) => (
                  <ClientTableRow
                    key={client._id}
                    id={client._id}
                    name={client.name}
                    status={client.status}
                    totalBookings={client.totalBookings}
                    lastInteraction={toRelativeLabel(client.lastInteractionDate)}
                    initials={client.initials}
                    onClick={() => router.push(`/clients/${client._id}`)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {clients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No clients yet. Add your first client to start building the workspace.
          </div>
        )}
      </div>

      <ClientFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(values) => createClient(values)}
      />
    </DashboardLayout>
  )
}
