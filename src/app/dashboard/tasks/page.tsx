'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Bell,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { formatDate, getPriorityColor, getStatusColor, cn } from '@/lib/utils'

interface Task {
  _id: string
  title: string
  description?: string
  assigneeName: string
  assigneeEmail: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in-progress' | 'completed' | 'overdue'
  reminderCount: number
  daysRemaining: number
  isDelayRisk: boolean
  tags: string[]
}

export default function TasksPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [sendingReminder, setSendingReminder] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [statusFilter, priorityFilter])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      
      if (res.ok) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTasks()
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(tasks.filter(t => t._id !== taskId))
        toast({ title: 'Task deleted' })
      }
    } catch (error) {
      toast({ title: 'Failed to delete task', variant: 'destructive' })
    }
  }

  const handleSendReminder = async (taskId: string) => {
    setSendingReminder(taskId)
    try {
      const res = await fetch(`/api/tasks/${taskId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useAI: true }),
      })
      const data = await res.json()
      
      if (res.ok) {
        toast({ 
          title: 'Reminder sent! 🔔', 
          description: data.reminder.isAIGenerated ? 'AI-powered message sent' : 'Reminder sent successfully',
        })
        // Update reminder count locally
        setTasks(tasks.map(t => 
          t._id === taskId ? { ...t, reminderCount: t.reminderCount + 1 } : t
        ))
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({ 
        title: 'Failed to send reminder', 
        description: error.message,
        variant: 'destructive' 
      })
    } finally {
      setSendingReminder(null)
    }
  }

  const handleBulkReminder = async () => {
    if (selectedTasks.length === 0) {
      toast({ title: 'Select tasks first', variant: 'destructive' })
      return
    }

    try {
      const res = await fetch('/api/reminders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds: selectedTasks, useAI: true }),
      })
      const data = await res.json()
      
      if (res.ok) {
        toast({ 
          title: `Sent ${data.summary.sent} reminders! 🔔`, 
          description: `${data.summary.failed} failed`,
        })
        setSelectedTasks([])
        fetchTasks()
      }
    } catch (error) {
      toast({ title: 'Failed to send reminders', variant: 'destructive' })
    }
  }

  const toggleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedTasks.length === tasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(tasks.map(t => t._id))
    }
  }

  const getDeadlineColor = (daysRemaining: number, status: string) => {
    if (status === 'completed') return 'text-gray-500'
    if (daysRemaining < 0) return 'text-red-600'
    if (daysRemaining === 0) return 'text-orange-600'
    if (daysRemaining <= 2) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and track all your tasks</p>
        </div>
        <Link href="/dashboard/tasks/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedTasks.length} task(s) selected
              </span>
              <Button size="sm" onClick={handleBulkReminder} className="gap-2">
                <Bell className="h-4 w-4" />
                Send Bulk Reminder
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedTasks([])}>
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
              <p className="text-gray-500 mt-1">Create your first task to get started</p>
              <Link href="/dashboard/tasks/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Task
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox 
                        checked={selectedTasks.length === tasks.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Task</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Assignee</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Priority</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Deadline</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reminders</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tasks.map((task) => (
                    <tr key={task._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Checkbox 
                          checked={selectedTasks.includes(task._id)}
                          onCheckedChange={() => toggleSelectTask(task._id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          {task.isDelayRisk && (
                            <span className="text-red-500" title="High delay risk">⚠️</span>
                          )}
                          <div>
                            <Link 
                              href={`/dashboard/tasks/${task._id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                            >
                              {task.title}
                            </Link>
                            {task.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {task.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-gray-900">{task.assigneeName}</p>
                          <p className="text-xs text-gray-500">{task.assigneeEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className={getDeadlineColor(task.daysRemaining, task.status)}>
                          <p className="font-medium">
                            {task.status === 'completed' ? 'Done' :
                             task.daysRemaining < 0 ? `${Math.abs(task.daysRemaining)}d overdue` :
                             task.daysRemaining === 0 ? 'Today' :
                             task.daysRemaining === 1 ? 'Tomorrow' :
                             `${task.daysRemaining} days`}
                          </p>
                          <p className="text-xs">{formatDate(task.deadline)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-gray-400" />
                          <span>{task.reminderCount}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendReminder(task._id)}
                            disabled={sendingReminder === task._id || task.status === 'completed'}
                            className="gap-1"
                          >
                            {sendingReminder === task._id ? (
                              <>
                                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Nudge
                              </>
                            )}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/tasks/${task._id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/tasks/${task._id}/edit`} className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(task._id)}
                                className="flex items-center gap-2 text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
