'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  Sparkles,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface TaskActionsProps {
  taskId: string
  taskStatus: string
  showAll?: boolean
}

export default function TaskActions({ taskId, taskStatus, showAll = false }: TaskActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleSendReminder = async (useAI = true) => {
    setLoading('remind')
    try {
      const response = await fetch(`/api/tasks/${taskId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useAI }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Reminder sent!',
          description: 'The assignee has been notified via email.',
        })
        router.refresh()
      } else {
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
      setLoading(null)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setLoading(newStatus)
    try {
      const body: any = { status: newStatus }
      if (newStatus === 'completed') {
        body.completedAt = new Date().toISOString()
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: 'Status updated!',
          description: `Task marked as ${newStatus.replace('-', ' ')}`,
        })
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: 'Failed to update status',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    setLoading('delete')
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Task deleted',
          description: 'The task has been permanently removed.',
        })
        router.push('/dashboard/tasks')
        router.refresh()
      } else {
        const data = await response.json()
        toast({
          title: 'Failed to delete task',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
      setDeleteOpen(false)
    }
  }

  if (showAll) {
    return (
      <div className="space-y-2">
        <Button
          className="w-full justify-start gap-2"
          onClick={() => handleSendReminder(true)}
          disabled={loading === 'remind' || taskStatus === 'completed'}
        >
          {loading === 'remind' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Send AI Reminder
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => handleSendReminder(false)}
          disabled={loading === 'remind' || taskStatus === 'completed'}
        >
          <Bell className="h-4 w-4" />
          Send Standard Reminder
        </Button>

        <div className="border-t pt-2 mt-2">
          <p className="text-xs text-gray-500 mb-2">Change Status</p>
          
          {taskStatus !== 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 mb-1"
              onClick={() => handleStatusChange('pending')}
              disabled={loading === 'pending'}
            >
              <Clock className="h-4 w-4" />
              Mark Pending
            </Button>
          )}

          {taskStatus !== 'in-progress' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 mb-1"
              onClick={() => handleStatusChange('in-progress')}
              disabled={loading === 'in-progress'}
            >
              <PlayCircle className="h-4 w-4" />
              Mark In Progress
            </Button>
          )}

          {taskStatus !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 mb-1 text-green-600 hover:text-green-700"
              onClick={() => handleStatusChange('completed')}
              disabled={loading === 'completed'}
            >
              <CheckCircle className="h-4 w-4" />
              Mark Completed
            </Button>
          )}

          {taskStatus !== 'overdue' && taskStatus !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
              onClick={() => handleStatusChange('overdue')}
              disabled={loading === 'overdue'}
            >
              <XCircle className="h-4 w-4" />
              Mark Overdue
            </Button>
          )}
        </div>

        <div className="border-t pt-2 mt-2">
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this task? This action cannot be undone.
                  All associated reminders and comments will also be deleted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading === 'delete'}
                >
                  {loading === 'delete' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  // Compact version for header
  return (
    <>
      <Button
        variant="default"
        className="gap-2"
        onClick={() => handleSendReminder(true)}
        disabled={loading === 'remind' || taskStatus === 'completed'}
      >
        {loading === 'remind' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        Send Reminder
      </Button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading === 'delete'}
            >
              {loading === 'delete' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
