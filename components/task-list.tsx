'use client'

import React, { useState } from 'react'
import { TaskItem, Task } from './task-item'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onTaskToggle: (id: string) => void
  onAddTask: (title: string) => void
  onTaskUpdate?: (id: string, title: string) => void
  onTaskDelete?: (id: string) => void
}

export function TaskList({ tasks, onTaskToggle, onAddTask, onTaskUpdate, onTaskDelete }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle)
      setNewTaskTitle('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Add */}
      <form onSubmit={handleAdd} className="relative group">
        <Input 
          placeholder="Quick add task..." 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="pr-12 h-12 bg-background border-border/50 focus:border-primary/50 transition-all shadow-sm rounded-xl"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newTaskTitle.trim()}
          className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg transition-all active:scale-90 disabled:opacity-30"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </form>

      {/* Task Grid */}
      {tasks.length > 0 ? (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onTaskToggle}
              onUpdate={onTaskUpdate}
              onDelete={onTaskDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-2xl border border-dashed border-border/50">
          <div className="p-4 rounded-full bg-primary/10 mb-4 text-primary">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold">Create your first task</h3>
          <p className="text-muted-foreground max-w-sm mt-2 text-sm mb-6">
            Keep track of what you need to do. Add your first task using the quick add field above, or press <kbd className="px-2 py-0.5 rounded-md bg-muted text-xs mx-1">Cmd K</kbd> anywhere.
          </p>
        </div>
      )}
    </div>
  )
}
