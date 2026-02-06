'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Bell, Menu, Search, Plus, LogOut, User, Settings, Loader2, X, Clock, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'

interface Task {
  _id: string
  title: string
  assigneeName: string
  status: string
  priority: string
}

interface Notification {
  _id: string
  taskId: string
  taskTitle: string
  recipientName: string
  status: string
  createdAt: string
  tone: string
}

interface DashboardNavProps {
  user: {
    userId: string
    name: string
    email: string
  }
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  const fetchNotifications = async () => {
    setNotifLoading(true)
    try {
      const response = await fetch('/api/reminders/logs?limit=5')
      const data = await response.json()
      if (response.ok) {
        setNotifications(data.logs || [])
        setUnreadCount(data.logs?.filter((n: Notification) => n.status === 'sent').length || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setNotifLoading(false)
    }
  }

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search tasks
  useEffect(() => {
    const searchTasks = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(`/api/tasks?search=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        if (response.ok) {
          setSearchResults(data.tasks?.slice(0, 5) || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchTasks, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Clear custom auth token
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Clear NextAuth session (for Google login)
      await signOut({ redirect: false })
      
      toast({
        title: 'Logged out',
        description: 'See you soon!',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-5 w-5" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold hidden sm:block gradient-text">Chaser Agent</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 pr-10 bg-gray-50 border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border max-h-80 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((task) => (
                      <Link
                        key={task._id}
                        href={`/dashboard/tasks/${task._id}`}
                        onClick={() => { setShowResults(false); setSearchQuery('') }}
                        className="block p-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <span>{task.assigneeName}</span>
                          <span>•</span>
                          <span className={`capitalize ${
                            task.status === 'completed' ? 'text-green-600' :
                            task.status === 'overdue' ? 'text-red-600' :
                            task.status === 'in-progress' ? 'text-blue-600' : 'text-yellow-600'
                          }`}>{task.status}</span>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/dashboard/tasks?search=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setShowResults(false)}
                      className="block p-3 text-center text-sm text-blue-600 hover:bg-blue-50 border-t"
                    >
                      View all results →
                    </Link>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No tasks found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/tasks/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </Link>

          {/* Notifications Dropdown */}
          <DropdownMenu onOpenChange={(open) => open && fetchNotifications()}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notifLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                </div>
              ) : notifications.length > 0 ? (
                <>
                  {notifications.map((notif) => (
                    <DropdownMenuItem key={notif._id} asChild>
                      <Link 
                        href={`/dashboard/tasks/${notif.taskId}`}
                        className="flex items-start gap-3 p-3 cursor-pointer"
                      >
                        <div className={`p-2 rounded-full ${
                          notif.tone === 'escalation' ? 'bg-red-100' :
                          notif.tone === 'urgent' ? 'bg-orange-100' :
                          notif.tone === 'firm' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <Mail className={`h-4 w-4 ${
                            notif.tone === 'escalation' ? 'text-red-600' :
                            notif.tone === 'urgent' ? 'text-orange-600' :
                            notif.tone === 'firm' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notif.taskTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            Reminder sent to {notif.recipientName}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {notif.status === 'sent' && (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link 
                      href="/dashboard/reminders" 
                      className="text-center text-sm text-blue-600 hover:text-blue-700 cursor-pointer justify-center"
                    >
                      View all notifications →
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  No notifications yet
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden lg:block text-sm font-medium">{user.name}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
