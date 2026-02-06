'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  assigneeName: z.string().min(2, 'Assignee name is required'),
  assigneeEmail: z.string().email('Invalid email address'),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'in-progress', 'completed', 'overdue']),
  category: z.string().optional(),
  tags: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface EditTaskPageProps {
  params: Promise<{ id: string }>
}

export default function EditTaskPage({ params }: EditTaskPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [taskId, setTaskId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: 'pending',
    },
  })

  useEffect(() => {
    const loadTask = async () => {
      const { id } = await params
      setTaskId(id)

      try {
        const response = await fetch(`/api/tasks/${id}`)
        const data = await response.json()

        if (response.ok) {
          const task = data.task
          reset({
            title: task.title,
            description: task.description || '',
            assigneeName: task.assigneeName,
            assigneeEmail: task.assigneeEmail,
            deadline: new Date(task.deadline).toISOString().slice(0, 16),
            priority: task.priority,
            status: task.status,
            category: task.category || '',
            tags: task.tags?.join(', ') || '',
          })
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load task',
            variant: 'destructive',
          })
          router.push('/dashboard/tasks')
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load task',
          variant: 'destructive',
        })
        router.push('/dashboard/tasks')
      } finally {
        setLoading(false)
      }
    }

    loadTask()
  }, [params, reset, router, toast])

  const onSubmit = async (data: TaskFormData) => {
    if (!taskId) return
    
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        deadline: new Date(data.deadline).toISOString(),
        tags: data.tags
          ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: 'Task updated!',
          description: 'Your changes have been saved.',
        })
        router.push(`/dashboard/tasks/${taskId}`)
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update task',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={taskId ? `/dashboard/tasks/${taskId}` : '/dashboard/tasks'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
          <p className="text-gray-500">Update task details</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              Modify the task information below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter task title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                rows={4}
                {...register('description')}
              />
            </div>

            {/* Assignee Name & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigneeName">
                  Assignee Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="assigneeName"
                  placeholder="John Doe"
                  {...register('assigneeName')}
                  className={errors.assigneeName ? 'border-red-500' : ''}
                />
                {errors.assigneeName && (
                  <p className="text-sm text-red-500">{errors.assigneeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigneeEmail">
                  Assignee Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="assigneeEmail"
                  type="email"
                  placeholder="john@example.com"
                  {...register('assigneeEmail')}
                  className={errors.assigneeEmail ? 'border-red-500' : ''}
                />
                {errors.assigneeEmail && (
                  <p className="text-sm text-red-500">{errors.assigneeEmail.message}</p>
                )}
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                {...register('deadline')}
                className={errors.deadline ? 'border-red-500' : ''}
              />
              {errors.deadline && (
                <p className="text-sm text-red-500">{errors.deadline.message}</p>
              )}
            </div>

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Priority <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('priority')}
                  onValueChange={(value: any) => setValue('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value: any) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Development, Design, Marketing"
                {...register('category')}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Comma-separated tags (e.g., urgent, frontend)"
                {...register('tags')}
              />
              <p className="text-xs text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
              <Link href={taskId ? `/dashboard/tasks/${taskId}` : '/dashboard/tasks'}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
