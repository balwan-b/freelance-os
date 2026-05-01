'use client'

import { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Topbar } from '@/components/topbar'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)} 
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} flex flex-col min-h-screen`}>
        {/* Topbar */}
        <Topbar isCollapsed={isCollapsed} onMenuClick={() => setIsMobileOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 mt-16 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl w-full h-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
