'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { taskSchema, type TaskInput } from '@/lib/validations'
import { useToast } from '@/components/ui/use-toast'

export default function NewTaskPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: 'todo',
      tags: [],
    },
  })

  const onSubmit = async (data: TaskInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create task')
      }

      toast({
        title: 'Task Created! 🎉',
        description: 'Reminder schedule activated',
      })

      router.push('/dashboard/tasks')
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDate = today.toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/tasks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-500">Add a task and we'll handle the reminders</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Task Details
          </CardTitle>
          <CardDescription>
            Fill in the details below. AI-powered reminders will be sent automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete API Integration"
                {...register('title')}
                disabled={isLoading}
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
                placeholder="Add details about the task..."
                rows={4}
                {...register('description')}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Assignee Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assigneeName">Assignee Name *</Label>
                <Input
                  id="assigneeName"
                  placeholder="John Doe"
                  {...register('assigneeName')}
                  disabled={isLoading}
                />
                {errors.assigneeName && (
                  <p className="text-sm text-red-500">{errors.assigneeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigneeEmail">Assignee Email *</Label>
                <Input
                  id="assigneeEmail"
                  type="email"
                  placeholder="john@example.com"
                  {...register('assigneeEmail')}
                  disabled={isLoading}
                />
                {errors.assigneeEmail && (
                  <p className="text-sm text-red-500">{errors.assigneeEmail.message}</p>
                )}
              </div>
            </div>

            {/* Deadline and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  min={minDate}
                  {...register('deadline')}
                  disabled={isLoading}
                />
                {errors.deadline && (
                  <p className="text-sm text-red-500">{errors.deadline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(value) => setValue('priority', value as any)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-500">{errors.priority.message}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                placeholder="e.g., Development, Design, Marketing"
                {...register('category')}
                disabled={isLoading}
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">🤖 Automated Reminders</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 3 days before deadline - Friendly reminder</li>
                <li>• 1 day before deadline - Urgent reminder</li>
                <li>• On deadline day - Final reminder</li>
                <li>• After deadline - Daily escalation</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Link href="/dashboard/tasks" className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
