'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Bell, 
  BarChart3, 
  Settings, 
  Zap,
  History,
  ChevronLeft,
  ChevronRight,
  Award,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', href: '/dashboard/tasks' },
  { icon: Bell, label: 'Reminders', href: '/dashboard/reminders' },
  { icon: History, label: 'History', href: '/dashboard/history' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Zap, label: 'Automation', href: '/dashboard/automation' },
  { icon: Award, label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden hidden" />
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-xl border-r border-gray-200/60 transition-all duration-300 z-40 hidden lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-500" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-500" />
          )}
        </button>

        <nav className="p-3 space-y-1 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700 shadow-sm sidebar-active"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors", 
                    isActive ? "text-violet-600" : "group-hover:text-violet-500"
                  )} />
                  {!collapsed && (
                    <span className={cn(
                      "font-medium truncate text-sm",
                      isActive && "font-semibold"
                    )}>{item.label}</span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      {item.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Quick actions */}
        {!collapsed && (
          <div className="p-3">
            <div className="p-4 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-violet-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4" />
                <p className="font-semibold text-sm">Pro Tip</p>
              </div>
              <p className="text-xs text-violet-100 leading-relaxed">Set up automation rules to save time</p>
              <Link href="/dashboard/automation">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-3 w-full bg-white/90 text-violet-700 hover:bg-white font-semibold text-xs h-8"
                >
                  Setup Rules →
                </Button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
