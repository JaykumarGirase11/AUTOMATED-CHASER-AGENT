'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Bell,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface AnalyticsData {
  overview: {
    totalTasks: number
    overdueTasks: number
    completedTasks: number
    completionRate: number
    onTimeRate: number
    totalReminders: number
    remindersToday: number
    remindersThisWeek: number
    aiPercentage: number
  }
  tasksByStatus: Record<string, number>
  tasksByPriority: Record<string, number>
  remindersByStatus: Record<string, number>
  mostRemindedTasks: Array<{
    _id: string
    title: string
    reminderCount: number
    assigneeName: string
    status: string
    priority: string
  }>
  trends: {
    completion: Array<{ _id: string; count: number }>
    taskCreation: Array<{ _id: string; count: number }>
    reminders: Array<{ _id: string; count: number }>
  }
}

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')
  const [data, setData] = useState<AnalyticsData | null>(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?period=${period}`)
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch analytics',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const exportToCSV = () => {
    if (!data) return

    const csvData = [
      ['Metric', 'Value'],
      ['Total Tasks', data.overview.totalTasks],
      ['Pending Tasks', data.tasksByStatus.todo || 0],
      ['In Progress Tasks', data.tasksByStatus['in-progress'] || 0],
      ['Completed Tasks', data.overview.completedTasks],
      ['Overdue Tasks', data.overview.overdueTasks],
      ['Completion Rate', `${data.overview.completionRate}%`],
      ['Total Reminders', data.overview.totalReminders],
      ['AI Generated %', `${data.overview.aiPercentage}%`],
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Export complete',
      description: 'Analytics data has been exported to CSV',
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Failed to load analytics</h3>
          <p className="text-gray-500 mb-4">Please try again later</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    )
  }

  const statusData = [
    { name: 'Pending', value: data.tasksByStatus?.todo || 0, color: '#f59e0b' },
    { name: 'In Progress', value: data.tasksByStatus?.['in-progress'] || 0, color: '#3b82f6' },
    { name: 'Completed', value: data.tasksByStatus?.completed || 0, color: '#10b981' },
    { name: 'Overdue', value: data.tasksByStatus?.overdue || 0, color: '#ef4444' },
  ]
  
  // If no data, show at least one item for the chart
  const hasStatusData = statusData.some(item => item.value > 0)
  const displayStatusData = hasStatusData ? statusData.filter(item => item.value > 0) : statusData

  const priorityData = [
    { name: 'High', value: data.tasksByPriority?.high || 0, color: '#ef4444' },
    { name: 'Medium', value: data.tasksByPriority?.medium || 0, color: '#f59e0b' },
    { name: 'Low', value: data.tasksByPriority?.low || 0, color: '#10b981' },
  ]
  const hasPriorityData = priorityData.some(item => item.value > 0)
  const displayPriorityData = hasPriorityData ? priorityData.filter(item => item.value > 0) : priorityData

  // Weekly activity data
  const weeklyData = data.trends?.taskCreation?.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
    created: item.count,
    completed: data.trends?.completion?.find(c => c._id === item._id)?.count || 0
  })) || []

  // Reminder activity data
  const reminderActivityData = data.trends?.reminders?.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    reminders: item.count
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Track your task performance and reminder effectiveness</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-3xl font-bold">{data.overview.totalTasks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-3xl font-bold">{data.overview.completionRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Reminders Sent</p>
                <p className="text-3xl font-bold">{data.overview.totalReminders}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overdue Tasks</p>
                <p className="text-3xl font-bold text-red-600">{data.overview.overdueTasks}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {hasStatusData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {displayStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Tasks created vs completed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="created" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#93c5fd" 
                      name="Created"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="2"
                      stroke="#10b981" 
                      fill="#6ee7b7" 
                      name="Completed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No activity data yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tasks grouped by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {hasPriorityData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayPriorityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {displayPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No priority data yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reminder Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Reminder Activity</CardTitle>
            <CardDescription>Reminders sent over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {reminderActivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reminderActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="reminders" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6' }}
                      name="Reminders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No reminder data yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* AI vs Standard Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI-Powered Reminders</CardTitle>
            <CardDescription>Comparison of AI vs standard reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'AI Generated', value: Math.round((data.overview.aiPercentage / 100) * data.overview.totalReminders) },
                      { name: 'Standard', value: data.overview.totalReminders - Math.round((data.overview.aiPercentage / 100) * data.overview.totalReminders) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#d1d5db" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <p className="text-2xl font-bold text-purple-600">
                {data.overview.aiPercentage}%
              </p>
              <p className="text-sm text-gray-500">AI Adoption Rate</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Assignees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Reminded Tasks</CardTitle>
            <CardDescription>Tasks with most reminders sent</CardDescription>
          </CardHeader>
          <CardContent>
            {data.mostRemindedTasks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {data.mostRemindedTasks.slice(0, 5).map((task, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {task.assigneeName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.assigneeName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">
                        {task.reminderCount}
                      </p>
                      <p className="text-xs text-gray-500">reminders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">On-Time Rate</span>
              <span className="font-medium">
                {data.overview.onTimeRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Reminders Today</span>
              <span className="font-medium text-green-600">
                {data.overview.remindersToday}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Active Tasks</span>
              <span className="font-medium">
                {(data.tasksByStatus.todo || 0) + (data.tasksByStatus['in-progress'] || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Completion Rate</span>
              <span className="font-medium">
                {data.overview.completionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Reminders This Week</span>
              <span className="font-medium">
                {data.overview.remindersThisWeek}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
