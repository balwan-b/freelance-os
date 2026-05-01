'use client'

import React, { useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { PageHeader } from '@/components/page-header'
import { TaskList } from '@/components/task-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/use-current-user'

function isTodayString(date?: string) {
  return date === new Date().toISOString().split('T')[0]
}

export default function TasksPage() {
  const { currentUser, isLoading } = useCurrentUser()
  const tasks = useQuery(api.tasks.list, currentUser ? {} : 'skip')
  const toggleTask = useMutation(api.tasks.toggle)
  const createTask = useMutation(api.tasks.create)

  const todayTasks = useMemo(
    () => (tasks ?? []).filter((task: any) => isTodayString(task.dueDate)),
    [tasks],
  )

  const upcomingTasks = useMemo(
    () =>
      (tasks ?? []).filter((task: any) => {
        if (!task.dueDate) return false
        return task.dueDate > new Date().toISOString().split('T')[0]
      }),
    [tasks],
  )

  if (isLoading || currentUser === null || tasks === undefined) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-muted-foreground">Loading tasks...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader
          title="Tasks"
          description="Stay organized and track your daily priorities."
        />

        <Tabs defaultValue="today" className="w-full">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="today">
              <TaskList
                tasks={todayTasks.map((task: any) => ({
                  id: task._id,
                  title: task.title,
                  completed: task.completed,
                  dueDate: task.dueDate,
                }))}
                onTaskToggle={(id) => toggleTask({ taskId: id as any })}
                onAddTask={(title) => createTask({ title, dueDate: new Date().toISOString().split('T')[0] })}
              />
            </TabsContent>
            <TabsContent value="upcoming">
              <TaskList
                tasks={upcomingTasks.map((task: any) => ({
                  id: task._id,
                  title: task.title,
                  completed: task.completed,
                  dueDate: task.dueDate,
                }))}
                onTaskToggle={(id) => toggleTask({ taskId: id as any })}
                onAddTask={(title) => createTask({ title, dueDate: new Date().toISOString().split('T')[0] })}
              />
            </TabsContent>
            <TabsContent value="all">
              <TaskList
                tasks={tasks.map((task: any) => ({
                  id: task._id,
                  title: task.title,
                  completed: task.completed,
                  dueDate: task.dueDate,
                }))}
                onTaskToggle={(id) => toggleTask({ taskId: id as any })}
                onAddTask={(title) => createTask({ title, dueDate: new Date().toISOString().split('T')[0] })}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
