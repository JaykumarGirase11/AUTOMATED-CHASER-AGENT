import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTimeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getDaysUntilDeadline(deadline: Date | string): number {
  const d = new Date(deadline)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }
}

export function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'high': return '🔴'
    case 'medium': return '🟡'
    case 'low': return '🟢'
    default: return '⚪'
  }
}

export function getUrgencyLevel(daysUntil: number, priority: string): 'critical' | 'urgent' | 'normal' | 'low' {
  if (daysUntil < 0) return 'critical'
  if (daysUntil === 0) return 'urgent'
  if (daysUntil <= 1 && priority === 'high') return 'urgent'
  if (daysUntil <= 3 && priority === 'high') return 'normal'
  return 'low'
}

export function getReminderTone(reminderCount: number, daysUntil: number): 'friendly' | 'firm' | 'urgent' | 'escalation' {
  if (daysUntil < 0) return 'escalation'
  if (reminderCount >= 4) return 'urgent'
  if (reminderCount >= 2 || daysUntil <= 1) return 'firm'
  return 'friendly'
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function isWorkingHours(): boolean {
  const now = new Date()
  const hours = now.getHours()
  return hours >= 8 && hours < 22
}

export function getNextWorkingHour(): Date {
  const now = new Date()
  const next = new Date(now)
  
  if (now.getHours() >= 22) {
    next.setDate(next.getDate() + 1)
    next.setHours(9, 0, 0, 0)
  } else if (now.getHours() < 8) {
    next.setHours(9, 0, 0, 0)
  }
  
  return next
}
