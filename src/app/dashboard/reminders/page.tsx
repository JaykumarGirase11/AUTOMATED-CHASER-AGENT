'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, 
  Clock, 
  Calendar,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Filter,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { formatDateTime, getDaysUntilDeadline, getPriorityColor } from '@/lib/utils'

interface Task {
  _id: string
  title: string
  assigneeName: string
  assigneeEmail: string
  deadline: string
  priority: string
  status: string
  reminderCount: number
  lastReminderSent?: string
  daysRemaining: number
}

export default function RemindersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState('pending')

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        if (filter === 'pending') {
          params.append('status', 'pending')
          params.append('status', 'in-progress')
        } else {
          params.append('status', filter)
        }
      }

      const response = await fetch(`/api/tasks?${params}`)
      const data = await response.json()

      if (response.ok) {
        const tasksWithDays = data.tasks.map((task: any) => ({
          ...task,
          daysRemaining: getDaysUntilDeadline(task.deadline),
        }))
        // Sort by urgency (overdue first, then by days remaining)
        tasksWithDays.sort((a: Task, b: Task) => a.daysRemaining - b.daysRemaining)
        setTasks(tasksWithDays)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const handleSendReminder = async (taskId: string, useAI = true) => {
    setSending(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useAI }),
      })

      if (response.ok) {
        toast({
          title: 'Reminder sent!',
          description: 'The assignee has been notified.',
        })
        fetchTasks()
      } else {
        const data = await response.json()
        toast({
          title: 'Failed to send reminder',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reminder',
        variant: 'destructive',
      })
    } finally {
      setSending(null)
    }
  }

  const handleBulkReminders = async () => {
    const overdueTasks = tasks.filter(t => t.daysRemaining < 0)
    const urgentTasks = tasks.filter(t => t.daysRemaining >= 0 && t.daysRemaining <= 1)
    const taskIds = [...overdueTasks, ...urgentTasks].map(t => t._id)

    if (taskIds.length === 0) {
      toast({
        title: 'No urgent tasks',
        description: 'There are no overdue or urgent tasks to remind.',
      })
      return
    }

    setSending('bulk')
    try {
      const response = await fetch('/api/reminders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds, useAI: true }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Bulk reminders sent!',
          description: `Successfully sent ${data.success} reminders.`,
        })
        fetchTasks()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send bulk reminders',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send bulk reminders',
        variant: 'destructive',
      })
    } finally {
      setSending(null)
    }
  }

  const getUrgencyBadge = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return <Badge variant="destructive">{Math.abs(daysRemaining)} days overdue</Badge>
    }
    if (daysRemaining === 0) {
      return <Badge variant="destructive">Due today</Badge>
    }
    if (daysRemaining === 1) {
      return <Badge className="bg-orange-500">Due tomorrow</Badge>
    }
    if (daysRemaining <= 3) {
      return <Badge className="bg-yellow-500">{daysRemaining} days left</Badge>
    }
    return <Badge variant="secondary">{daysRemaining} days left</Badge>
  }

  const overdueTasks = tasks.filter(t => t.daysRemaining < 0)
  const urgentTasks = tasks.filter(t => t.daysRemaining >= 0 && t.daysRemaining <= 1)
  const upcomingTasks = tasks.filter(t => t.daysRemaining > 1 && t.daysRemaining <= 7)
  const laterTasks = tasks.filter(t => t.daysRemaining > 7)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="text-gray-500">Send reminders to task assignees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTasks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={handleBulkReminders}
            disabled={sending === 'bulk'}
          >
            {sending === 'bulk' ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Urgent Reminders
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueTasks.length}</p>
                <p className="text-sm text-gray-500">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{urgentTasks.length}</p>
                <p className="text-sm text-gray-500">Due Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingTasks.length}</p>
                <p className="text-sm text-gray-500">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{laterTasks.length}</p>
                <p className="text-sm text-gray-500">Later</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending & In Progress</SelectItem>
                <SelectItem value="overdue">Overdue Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Sections */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">No tasks found</h3>
              <p className="text-gray-500 mt-1">
                All caught up! No pending tasks need reminders.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="border-red-200">
              <CardHeader className="bg-red-50 rounded-t-lg">
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
                <CardDescription className="text-red-600">
                  These tasks need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <TaskRow 
                      key={task._id} 
                      task={task} 
                      sending={sending}
                      onSendReminder={handleSendReminder}
                      getUrgencyBadge={getUrgencyBadge}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Urgent Tasks */}
          {urgentTasks.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50 rounded-t-lg">
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Due Soon ({urgentTasks.length})
                </CardTitle>
                <CardDescription className="text-orange-600">
                  Due today or tomorrow
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {urgentTasks.map((task) => (
                    <TaskRow 
                      key={task._id} 
                      task={task} 
                      sending={sending}
                      onSendReminder={handleSendReminder}
                      getUrgencyBadge={getUrgencyBadge}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  This Week ({upcomingTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <TaskRow 
                      key={task._id} 
                      task={task} 
                      sending={sending}
                      onSendReminder={handleSendReminder}
                      getUrgencyBadge={getUrgencyBadge}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Later Tasks */}
          {laterTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <Bell className="h-5 w-5" />
                  Later ({laterTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {laterTasks.map((task) => (
                    <TaskRow 
                      key={task._id} 
                      task={task} 
                      sending={sending}
                      onSendReminder={handleSendReminder}
                      getUrgencyBadge={getUrgencyBadge}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

interface TaskRowProps {
  task: Task
  sending: string | null
  onSendReminder: (taskId: string, useAI?: boolean) => void
  getUrgencyBadge: (days: number) => React.ReactNode
}

function TaskRow({ task, sending, onSendReminder, getUrgencyBadge }: TaskRowProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link 
            href={`/dashboard/tasks/${task._id}`}
            className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
          >
            {task.title}
          </Link>
          {getUrgencyBadge(task.daysRemaining)}
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span>{task.assigneeName}</span>
          <span>•</span>
          <span>{formatDateTime(task.deadline)}</span>
          {task.reminderCount > 0 && (
            <>
              <span>•</span>
              <span>{task.reminderCount} reminders sent</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSendReminder(task._id, false)}
          disabled={sending === task._id}
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          onClick={() => onSendReminder(task._id, true)}
          disabled={sending === task._id}
        >
          {sending === task._id ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1" />
          )}
          AI Nudge
        </Button>
      </div>
    </div>
  )
}
