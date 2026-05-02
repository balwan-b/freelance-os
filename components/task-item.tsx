'use client'

import React, { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Pencil, Trash2, User, X, Check } from 'lucide-react'

export interface Task {
  id: string
  title: string
  completed: boolean
  client?: string
  dueDate?: string
}

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onUpdate?: (id: string, title: string) => void
  onDelete?: (id: string) => void
}

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  const save = () => {
    const next = title.trim()
    if (!next) return
    onUpdate?.(task.id, next)
    setIsEditing(false)
  }

  return (
    <div className={cn(
      "flex items-center gap-4 p-3 rounded-xl border border-border bg-card transition-all hover:shadow-sm",
      task.completed && "opacity-60 bg-muted/30"
    )}>
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
                if (e.key === 'Escape') {
                  setTitle(task.title)
                  setIsEditing(false)
                }
              }}
              className="h-8"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={save}>
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => {
                setTitle(task.title)
                setIsEditing(false)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className={cn(
            "text-sm font-medium transition-all",
            task.completed ? "line-through text-muted-foreground" : "text-foreground"
          )}>
            {task.title}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          {task.client && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              <User className="w-2.5 h-2.5" />
              {task.client}
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              <Calendar className="w-2.5 h-2.5" />
              {task.dueDate}
            </div>
          )}
        </div>
      </div>
      {!isEditing && (onUpdate || onDelete) ? (
        <div className="flex items-center gap-1">
          {onUpdate ? (
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDelete(task.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
