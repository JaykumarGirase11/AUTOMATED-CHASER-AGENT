import { Suspense } from 'react'
import Link from 'next/link'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Bell, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getAuthUser } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import ReminderLog from '@/models/ReminderLog'
import { formatDate, getDaysUntilDeadline, getPriorityColor, getStatusColor } from '@/lib/utils'

async function getDashboardData(userId: string) {
  await dbConnect()

  const now = new Date()
  const todayStart = new Date(now.setHours(0, 0, 0, 0))

  // Update overdue tasks
  await Task.updateMany(
    {
      createdBy: userId,
      status: { $nin: ['completed', 'overdue'] },
      deadline: { $lt: todayStart },
    },
    { $set: { status: 'overdue' } }
  )

  // Get stats
  const totalTasks = await Task.countDocuments({ createdBy: userId })
  const completedTasks = await Task.countDocuments({ createdBy: userId, status: 'completed' })
  const overdueTasks = await Task.countDocuments({ createdBy: userId, status: 'overdue' })
  const inProgressTasks = await Task.countDocuments({ createdBy: userId, status: 'in-progress' })

  // Get recent tasks
  const recentTasks = await Task.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  // Get upcoming deadlines
  const upcomingTasks = await Task.find({
    createdBy: userId,
    status: { $nin: ['completed'] },
    deadline: { $gte: todayStart },
  })
    .sort({ deadline: 1 })
    .limit(5)
    .lean()

  // Get today's reminders
  const remindersToday = await ReminderLog.countDocuments({
    createdBy: userId,
    createdAt: { $gte: todayStart },
  })

  // Get recent reminders
  const recentReminders = await ReminderLog.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  return {
    stats: {
      totalTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks,
      remindersToday,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    recentTasks: recentTasks.map(t => ({
      ...t,
      _id: t._id.toString(),
      daysRemaining: getDaysUntilDeadline(t.deadline),
    })),
    upcomingTasks: upcomingTasks.map(t => ({
      ...t,
      _id: t._id.toString(),
      daysRemaining: getDaysUntilDeadline(t.deadline),
    })),
    recentReminders: recentReminders.map(r => ({
      ...r,
      _id: r._id.toString(),
      taskId: r.taskId.toString(),
    })),
  }
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  color = 'blue' 
}: { 
  title: string
  value: string | number
  description: string
  icon: any
  trend?: string
  color?: 'blue' | 'green' | 'red' | 'yellow'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const user = await getAuthUser()
  if (!user) return null

  const data = await getDashboardData(user.userId)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your tasks today
          </p>
        </div>
        <Link href="/dashboard/tasks/new">
          <Button className="mt-4 md:mt-0 gap-2">
            <Sparkles className="h-4 w-4" />
            Create Task
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={data.stats.totalTasks}
          description={`${data.stats.completionRate}% completion rate`}
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={data.stats.inProgressTasks}
          description="Tasks being worked on"
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Overdue"
          value={data.stats.overdueTasks}
          description="Need immediate attention"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Reminders Today"
          value={data.stats.remindersToday}
          description="Automated + manual"
          icon={Bell}
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Tasks due soon</CardDescription>
            </div>
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No upcoming deadlines</p>
                <Link href="/dashboard/tasks/new">
                  <Button variant="link" className="mt-2">Create a task</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.upcomingTasks.map((task: any) => (
                  <Link key={task._id} href={`/dashboard/tasks/${task._id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {task.assigneeName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-medium ${
                          task.daysRemaining <= 1 ? 'text-red-600' : 
                          task.daysRemaining <= 3 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {task.daysRemaining === 0 ? 'Today' :
                           task.daysRemaining === 1 ? 'Tomorrow' :
                           `${task.daysRemaining} days`}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(task.deadline)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reminders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reminders</CardTitle>
              <CardDescription>Latest sent reminders</CardDescription>
            </div>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No reminders sent yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentReminders.map((reminder: any) => (
                  <div key={reminder._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`p-2 rounded-full ${
                      reminder.status === 'sent' ? 'bg-green-100 text-green-600' :
                      reminder.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{reminder.taskTitle}</p>
                      <p className="text-sm text-gray-500">To: {reminder.recipientName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={reminder.status === 'sent' ? 'success' : 'destructive'}>
                          {reminder.status}
                        </Badge>
                        {reminder.isAIGenerated && (
                          <Badge variant="info" className="gap-1">
                            <Sparkles className="h-3 w-3" /> AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(reminder.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest created tasks</CardDescription>
          </div>
          <Link href="/dashboard/tasks">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">Task</th>
                  <th className="pb-3 font-medium text-gray-500">Assignee</th>
                  <th className="pb-3 font-medium text-gray-500">Priority</th>
                  <th className="pb-3 font-medium text-gray-500">Status</th>
                  <th className="pb-3 font-medium text-gray-500">Deadline</th>
                  <th className="pb-3 font-medium text-gray-500">Reminders</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTasks.map((task: any) => (
                  <tr key={task._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <Link href={`/dashboard/tasks/${task._id}`} className="hover:underline font-medium">
                        {task.title}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600">{task.assigneeName}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-600">{formatDate(task.deadline)}</td>
                    <td className="py-3 text-gray-600">{task.reminderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
