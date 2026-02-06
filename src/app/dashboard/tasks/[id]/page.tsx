import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Bell, 
  Clock, 
  User, 
  Mail,
  Calendar,
  Tag,
  MessageSquare,
  Sparkles,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAuthUser } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import ReminderLog from '@/models/ReminderLog'
import { formatDate, formatDateTime, getDaysUntilDeadline, getPriorityColor, getStatusColor } from '@/lib/utils'
import TaskActions from '@/components/dashboard/TaskActions'
import CommentSection from '@/components/dashboard/CommentSection'

interface TaskDetailPageProps {
  params: Promise<{ id: string }>
}

async function getTaskData(taskId: string, userId: string) {
  await dbConnect()

  const task = await Task.findOne({
    _id: taskId,
    createdBy: userId,
  }).lean()

  if (!task) return null

  const reminderLogs = await ReminderLog.find({ taskId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  return {
    task: {
      ...task,
      _id: task._id.toString(),
      createdBy: task.createdBy.toString(),
      daysRemaining: getDaysUntilDeadline(task.deadline),
      comments: task.comments.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        userId: c.userId.toString(),
      })),
    },
    reminderLogs: reminderLogs.map(r => ({
      ...r,
      _id: r._id.toString(),
      taskId: r.taskId.toString(),
      createdBy: r.createdBy.toString(),
    })),
  }
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const user = await getAuthUser()
  if (!user) return null

  const { id } = await params
  const data = await getTaskData(id, user.userId)

  if (!data) {
    notFound()
  }

  const { task, reminderLogs } = data

  const getDeadlineStatus = () => {
    if (task.status === 'completed') return { text: 'Completed', color: 'text-green-600' }
    if (task.daysRemaining < 0) return { text: `${Math.abs(task.daysRemaining)} days overdue`, color: 'text-red-600' }
    if (task.daysRemaining === 0) return { text: 'Due today!', color: 'text-orange-600' }
    if (task.daysRemaining === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' }
    return { text: `${task.daysRemaining} days remaining`, color: 'text-gray-600' }
  }

  const deadlineStatus = getDeadlineStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/tasks">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority} priority
              </Badge>
              {task.isDelayRisk && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Delay Risk
                </Badge>
              )}
            </div>
            <p className="text-gray-500 mt-1">{task.description || 'No description'}</p>
          </div>
        </div>
        
        <div className="flex gap-2 ml-12 md:ml-0">
          <Link href={`/dashboard/tasks/${task._id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <TaskActions taskId={task._id} taskStatus={task.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assignee</p>
                    <p className="font-medium">{task.assigneeName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{task.assigneeEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium">{formatDateTime(task.deadline)}</p>
                    <p className={`text-sm ${deadlineStatus.color}`}>{deadlineStatus.text}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reminders Sent</p>
                    <p className="font-medium">{task.reminderCount}</p>
                  </div>
                </div>
              </div>

              {task.tags && task.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex gap-2 flex-wrap">
                      {task.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {task.category && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Category</p>
                    <p className="font-medium">{task.category}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments ({task.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentSection taskId={task._id} initialComments={task.comments} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <TaskActions taskId={task._id} taskStatus={task.status} showAll />
            </CardContent>
          </Card>

          {/* Reminder History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reminder History
              </CardTitle>
              <CardDescription>Recent reminders sent for this task</CardDescription>
            </CardHeader>
            <CardContent>
              {reminderLogs.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No reminders sent yet
                </p>
              ) : (
                <div className="space-y-3">
                  {reminderLogs.map((log: any) => (
                    <div key={log._id} className="flex items-start gap-3 text-sm">
                      <div className={`mt-0.5 p-1.5 rounded-full ${
                        log.status === 'sent' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {log.isAIGenerated ? (
                          <Sparkles className={`h-3 w-3 ${
                            log.status === 'sent' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <Bell className={`h-3 w-3 ${
                            log.status === 'sent' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {log.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={log.status === 'sent' ? 'success' : 'destructive'} className="text-xs">
                            {log.status}
                          </Badge>
                          <span className="text-gray-400 text-xs">
                            #{log.reminderNumber}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {reminderLogs.length > 0 && (
                <Link href={`/dashboard/history?taskId=${task._id}`}>
                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    View All History
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Task Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-gray-500">{formatDateTime(task.createdAt)}</p>
                  </div>
                </div>
                {task.lastReminderSent && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                    <div>
                      <p className="font-medium">Last Reminder</p>
                      <p className="text-gray-500">{formatDateTime(task.lastReminderSent)}</p>
                    </div>
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-gray-500">{formatDateTime(task.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
