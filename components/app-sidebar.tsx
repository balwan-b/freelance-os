'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  LayoutGrid,
  MessageSquare,
  Users,
  Settings,
  List,
  CheckCircle,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-current-user'
import { UserButton } from '@clerk/nextjs'

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: List, label: 'Bookings', href: '/bookings' },
  { icon: CheckCircle, label: 'Tasks', href: '/tasks' },
  { icon: MessageCircle, label: 'Inbox', href: '/messages' },
  { icon: MessageSquare, label: 'Inquiries', href: '/inquiries' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface AppSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function AppSidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: AppSidebarProps) {
  const pathname = usePathname()
  const { currentUser } = useCurrentUser()
  const initials =
    currentUser?.name
      ?.split(' ')
      .map((part: string) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'FO'
  const planLabel = currentUser?.subscription?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen border-r border-border bg-background flex flex-col z-50 transition-all duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
      >
        <div className={`flex items-center justify-between px-6 py-8 ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isCollapsed && <h1 className="text-xl font-bold text-foreground">freelance-os</h1>}
          <Button variant="ghost" size="icon" onClick={onToggle} className="hidden md:flex">
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
                {isCollapsed && (
                  <div className="fixed left-20 bg-popover text-popover-foreground px-2 py-1 rounded shadow-md text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity ml-2 z-[60] whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4 space-y-3">
          {!isCollapsed ? (
            <div className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-center text-muted-foreground">
              {planLabel}
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div
                className={`w-8 h-1 rounded-full ${currentUser?.subscription?.plan === 'pro' ? 'bg-primary' : 'bg-muted-foreground/40'}`}
              />
            </div>
          )}

          <div className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser?.imageUrl} alt={currentUser?.name ?? 'User'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-none truncate">
                  {currentUser?.name ?? 'Loading...'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {currentUser?.email ?? 'Setting up your workspace'}
                </p>
              </div>
            )}
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </aside>
    </>
  )
}
