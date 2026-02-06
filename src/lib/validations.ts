import { z } from 'zod'

// User Schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Task Schema
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  assigneeName: z.string().min(1, 'Assignee name is required'),
  assigneeEmail: z.string().email('Invalid assignee email'),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['pending', 'todo', 'in-progress', 'completed', 'overdue']).default('pending'),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
})

export const updateTaskSchema = taskSchema.partial()

// Comment Schema
export const commentSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment is too long'),
  mentions: z.array(z.string()).optional(),
})

// Manual Reminder Schema
export const manualReminderSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  customMessage: z.string().max(500, 'Message is too long').optional(),
  channels: z.array(z.enum(['email', 'slack', 'push'])).default(['email']),
})

// Bulk Reminder Schema
export const bulkReminderSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'At least one task is required'),
  customMessage: z.string().max(500, 'Message is too long').optional(),
})

// Automation Rule Schema
export const automationRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  trigger: z.object({
    type: z.string(),
    conditions: z.record(z.any()).optional(),
  }),
  actions: z.array(z.object({
    type: z.string(),
    params: z.record(z.any()).optional(),
  })),
})

// User Settings Schema
export const userSettingsSchema = z.object({
  preferredReminderTime: z.string().optional(),
  timezone: z.string().default('Asia/Kolkata'),
  skipWeekends: z.boolean().default(false),
  digestMode: z.boolean().default(false),
  notificationChannels: z.object({
    email: z.boolean().default(true),
    slack: z.boolean().default(false),
    push: z.boolean().default(true),
  }),
  quietHoursStart: z.number().min(0).max(23).default(22),
  quietHoursEnd: z.number().min(0).max(23).default(8),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type ManualReminderInput = z.infer<typeof manualReminderSchema>
export type BulkReminderInput = z.infer<typeof bulkReminderSchema>
export type AutomationRuleInput = z.infer<typeof automationRuleSchema>
export type UserSettingsInput = z.infer<typeof userSettingsSchema>
