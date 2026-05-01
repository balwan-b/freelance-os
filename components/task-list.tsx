'use client'

import React, { useState } from 'react'
import { TaskItem, Task } from './task-item'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  onTaskToggle: (id: string) => void
  onAddTask: (title: string) => void
}

export function TaskList({ tasks, onTaskToggle, onAddTask }: TaskListProps) {
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
            <TaskItem key={task.id} task={task} onToggle={onTaskToggle} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/10 rounded-2xl border border-dashed border-border/50">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground max-w-xs mt-2 text-sm">
            Try adjusting your filters or add a new task above.
          </p>
        </div>
      )}
    </div>
  )
}
