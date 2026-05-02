'use client'

import { Badge } from '@/components/ui/badge'
import { TableRow, TableCell } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Clock, BookOpen, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Client } from './client-card'

interface ClientTableRowProps extends Client {
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
}

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  archived: 'Archived',
}

export function ClientTableRow({ name, status, totalBookings, lastInteraction, initials, onClick, onEdit, onDelete }: ClientTableRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/75 transition-colors"
      onClick={onClick}
    >
      <TableCell className="w-auto">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={statusColors[status]}>
          {statusLabels[status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span>{totalBookings} bookings</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{lastInteraction}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {onEdit || onDelete ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit ? (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                ) : null}
                {onDelete ? (
                  <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete() }}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </TableCell>
    </TableRow>
  )
}
