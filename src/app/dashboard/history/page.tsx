'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

interface ReminderLog {
  _id: string
  taskId: string
  taskTitle: string
  assigneeEmail: string
  assigneeName: string
  subject: string
  message: string
  status: 'sent' | 'failed' | 'pending'
  isAIGenerated: boolean
  reminderNumber: number
  channel: string
  createdAt: string
  errorMessage?: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function HistoryPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<ReminderLog[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    aiOnly: false,
  })

  const fetchLogs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.aiOnly) {
        params.append('isAIGenerated', 'true')
      }

      const response = await fetch(`/api/reminders/logs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
        setPagination(data.pagination)
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch reminder history',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch reminder history',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filters.status, filters.aiOnly])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLogs(1)
  }

  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true
    const searchLower = filters.search.toLowerCase()
    return (
      log.taskTitle?.toLowerCase().includes(searchLower) ||
      log.assigneeName?.toLowerCase().includes(searchLower) ||
      log.assigneeEmail?.toLowerCase().includes(searchLower) ||
      log.subject?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminder History</h1>
          <p className="text-gray-500">View all sent reminders and their delivery status</p>
        </div>
        <Button variant="outline" onClick={() => fetchLogs(pagination.page)}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by task, assignee, or subject..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant={filters.aiOnly ? 'default' : 'outline'}
              onClick={() => setFilters({ ...filters, aiOnly: !filters.aiOnly })}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Only
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-sm text-gray-500">Total Reminders</p>
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
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.status === 'sent').length}
                </p>
                <p className="text-sm text-gray-500">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.status === 'failed').length}
                </p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.isAIGenerated).length}
                </p>
                <p className="text-sm text-gray-500">AI Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Reminders
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {pagination.total} reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">No reminders found</h3>
              <p className="text-gray-500 mt-1">
                {filters.search || filters.status !== 'all' || filters.aiOnly
                  ? 'Try adjusting your filters'
                  : 'Start sending reminders to see them here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    log.status === 'sent' 
                      ? 'bg-green-100' 
                      : log.status === 'failed' 
                        ? 'bg-red-100' 
                        : 'bg-yellow-100'
                  }`}>
                    {log.isAIGenerated ? (
                      <Sparkles className={`h-5 w-5 ${
                        log.status === 'sent' 
                          ? 'text-green-600' 
                          : log.status === 'failed' 
                            ? 'text-red-600' 
                            : 'text-yellow-600'
                      }`} />
                    ) : (
                      <Mail className={`h-5 w-5 ${
                        log.status === 'sent' 
                          ? 'text-green-600' 
                          : log.status === 'failed' 
                            ? 'text-red-600' 
                            : 'text-yellow-600'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{log.subject}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          To: {log.assigneeName} ({log.assigneeEmail})
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant={
                            log.status === 'sent'
                              ? 'success'
                              : log.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {log.status}
                        </Badge>
                        {log.isAIGenerated && (
                          <Badge variant="outline" className="gap-1">
                            <Sparkles className="h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <Link 
                        href={`/dashboard/tasks/${log.taskId}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        Task: {log.taskTitle}
                      </Link>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(log.createdAt)}
                      </span>
                      <span>Reminder #{log.reminderNumber}</span>
                    </div>

                    {log.errorMessage && (
                      <p className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded">
                        Error: {log.errorMessage}
                      </p>
                    )}

                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                        View Message
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                        {log.message}
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchLogs(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
