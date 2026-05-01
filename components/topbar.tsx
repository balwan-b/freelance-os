'use client'

import { Search, Plus, Bell, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CommandPalette } from '@/components/command-palette'
import { useState } from 'react'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { UserButton } from '@clerk/nextjs'

interface TopbarProps {
  isCollapsed: boolean
  onMenuClick: () => void
}

export function Topbar({ isCollapsed, onMenuClick }: TopbarProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { currentUser } = useCurrentUser()
  const markNotificationRead = useMutation(api.users.markNotificationRead)
  const unreadNotifications = currentUser?.unreadNotifications ?? []

  return (
    <>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <div
        className={`fixed top-0 right-0 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 transition-all duration-300
        ${isCollapsed ? 'left-0 md:left-20' : 'left-0 md:left-64'}
      `}
      >
        <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 bg-muted border-0 placeholder:text-muted-foreground focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-2" onClick={() => setPaletteOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Add</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-muted bg-muted px-2 py-1 text-xs font-light text-muted-foreground ml-auto">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Bell className="w-4 h-4" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium">Notifications</p>
                </div>
                <DropdownMenuSeparator />
                {unreadNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    No new notifications.
                  </div>
                ) : (
                  unreadNotifications.map((notification: any) => (
                    <DropdownMenuItem
                      key={notification._id}
                      className="cursor-pointer p-3"
                      onSelect={() => markNotificationRead({ notificationId: notification._id })}
                    >
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer justify-center py-2 text-xs text-muted-foreground hover:text-foreground">
                  {unreadNotifications.length} unread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
    </>
  )
}
