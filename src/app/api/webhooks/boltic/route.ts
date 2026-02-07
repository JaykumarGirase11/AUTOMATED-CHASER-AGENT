import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'

export const dynamic = 'force-dynamic'
import ReminderLog from '@/models/ReminderLog'
import { getDaysUntilDeadline, getReminderTone, formatDate } from '@/lib/utils'
import { generateReminderMessage } from '@/services/ai'
import { sendEmail, generateReminderEmailHTML, generateEmailSubject } from '@/services/email'
import { triggerBolticWorkflow } from '@/services/boltic'

// This endpoint is called by Boltic webhooks to process scheduled reminders
// It should be triggered via a cron job or Boltic scheduler

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional security)
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (process.env.WEBHOOK_SECRET && webhookSecret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const { event, taskId } = body

    // Process different webhook events
    if (event === 'check_deadlines') {
      return await processScheduledReminders()
    }

    if (event === 'send_reminder' && taskId) {
      return await processTaskReminder(taskId)
    }

    return NextResponse.json({ 
      message: 'Webhook received',
      event,
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function processScheduledReminders() {
  const now = new Date()
  const today = new Date(now.setHours(0, 0, 0, 0))
  
  // Find tasks that need reminders
  // 1. Tasks due in 3 days
  // 2. Tasks due in 1 day
  // 3. Tasks due today
  // 4. Overdue tasks (for escalation)

  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  const oneDayFromNow = new Date(today)
  oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)

  const tasks = await Task.find({
    status: { $nin: ['completed'] },
    $or: [
      // 3 days before (if not reminded in last 24 hours)
      {
        deadline: {
          $gte: new Date(threeDaysFromNow.setHours(0, 0, 0, 0)),
          $lt: new Date(threeDaysFromNow.setHours(23, 59, 59, 999)),
        },
        $or: [
          { lastReminderSent: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          { lastReminderSent: { $exists: false } },
        ],
      },
      // 1 day before
      {
        deadline: {
          $gte: new Date(oneDayFromNow.setHours(0, 0, 0, 0)),
          $lt: new Date(oneDayFromNow.setHours(23, 59, 59, 999)),
        },
        $or: [
          { lastReminderSent: { $lt: new Date(Date.now() - 12 * 60 * 60 * 1000) } },
          { lastReminderSent: { $exists: false } },
        ],
      },
      // Due today
      {
        deadline: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999)),
        },
        $or: [
          { lastReminderSent: { $lt: new Date(Date.now() - 6 * 60 * 60 * 1000) } },
          { lastReminderSent: { $exists: false } },
        ],
      },
      // Overdue (escalation)
      {
        status: 'overdue',
        deadline: { $lt: today },
        $or: [
          { lastReminderSent: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          { lastReminderSent: { $exists: false } },
        ],
      },
    ],
  })

  const results = []

  for (const task of tasks) {
    try {
      const result = await sendTaskReminder(task)
      results.push({
        taskId: task._id,
        success: result.success,
        error: result.error,
      })
    } catch (e: any) {
      results.push({
        taskId: task._id,
        success: false,
        error: e.message,
      })
    }
  }

  return NextResponse.json({
    processed: tasks.length,
    results,
  })
}

async function processTaskReminder(taskId: string) {
  const task = await Task.findById(taskId)
  
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const result = await sendTaskReminder(task)
  
  return NextResponse.json(result)
}

async function sendTaskReminder(task: any) {
  const daysRemaining = getDaysUntilDeadline(task.deadline)
  const reminderCount = task.reminderCount + 1
  const tone = getReminderTone(reminderCount, daysRemaining)

  // Generate AI message
  let messageContent
  try {
    messageContent = await generateReminderMessage({
      recipientName: task.assigneeName,
      taskTitle: task.title,
      taskDescription: task.description,
      deadline: formatDate(task.deadline),
      priority: task.priority,
      daysRemaining,
      reminderCount,
    })
  } catch (e) {
    messageContent = {
      subject: generateEmailSubject(task.title, tone, reminderCount),
      body: `Reminder: ${task.title} is ${daysRemaining < 0 ? 'overdue' : `due in ${daysRemaining} days`}`,
      tone,
      isAIGenerated: false,
    }
  }

  // Generate and send email
  const emailHtml = generateReminderEmailHTML({
    recipientName: task.assigneeName,
    taskTitle: task.title,
    taskDescription: task.description,
    deadline: formatDate(task.deadline),
    priority: task.priority,
    daysRemaining,
    reminderCount,
    tone,
    appUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
  })

  const emailResult = await sendEmail({
    to: task.assigneeEmail,
    subject: messageContent.subject,
    html: emailHtml,
  })

  // Log reminder
  await ReminderLog.create({
    taskId: task._id,
    taskTitle: task.title,
    recipientEmail: task.assigneeEmail,
    recipientName: task.assigneeName,
    channel: 'email',
    messageType: 'scheduled',
    tone,
    subject: messageContent.subject,
    message: messageContent.body,
    isAIGenerated: messageContent.isAIGenerated,
    status: emailResult.success ? 'sent' : 'failed',
    errorMessage: emailResult.error,
    sentAt: emailResult.success ? new Date() : undefined,
    reminderNumber: reminderCount,
    createdBy: task.createdBy,
  })

  // Update task
  await Task.findByIdAndUpdate(task._id, {
    $inc: { reminderCount: 1 },
    $set: { lastReminderSent: new Date() },
  })

  // Trigger Boltic for tracking
  try {
    await triggerBolticWorkflow({
      event: 'reminder_triggered',
      taskId: task._id.toString(),
      taskTitle: task.title,
      assigneeName: task.assigneeName,
      assigneeEmail: task.assigneeEmail,
      deadline: task.deadline.toISOString(),
      priority: task.priority,
      status: task.status,
      daysRemaining,
      reminderCount,
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    // Non-blocking
  }

  return {
    success: emailResult.success,
    error: emailResult.error,
    reminderCount,
    tone,
  }
}
