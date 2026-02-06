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
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r transition-all duration-300 z-40 hidden lg:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-blue-600")} />
                  {!collapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Quick actions */}
        {!collapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
              <p className="font-medium text-sm">Need help?</p>
              <p className="text-xs text-blue-100 mt-1">Check out our docs</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-3 w-full bg-white text-blue-600 hover:bg-blue-50"
              >
                View Docs
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
