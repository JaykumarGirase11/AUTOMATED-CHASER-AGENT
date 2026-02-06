import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import ReminderLog from '@/models/ReminderLog'
import { getAuthUser } from '@/lib/auth'
import { getDaysUntilDeadline, getReminderTone, formatDate } from '@/lib/utils'
import { generateReminderMessage } from '@/services/ai'
import { sendEmail, generateReminderEmailHTML, generateEmailSubject } from '@/services/email'

// POST - Send bulk reminders for multiple tasks
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    const { taskIds, customMessage, useAI = true } = body

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one task ID is required' },
        { status: 400 }
      )
    }

    // Get tasks
    const tasks = await Task.find({
      _id: { $in: taskIds },
      createdBy: authUser.userId,
    })

    if (tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks found' }, { status: 404 })
    }

    const results: any[] = []

    // Process each task
    for (const task of tasks) {
      const daysRemaining = getDaysUntilDeadline(task.deadline)
      const reminderCount = task.reminderCount + 1
      const tone = getReminderTone(reminderCount, daysRemaining)

      let messageContent: { subject: string; body: string; isAIGenerated: boolean }

      // Generate message
      if (useAI) {
        try {
          const aiMessage = await generateReminderMessage({
            recipientName: task.assigneeName,
            taskTitle: task.title,
            taskDescription: task.description,
            deadline: formatDate(task.deadline),
            priority: task.priority,
            daysRemaining,
            reminderCount,
          })
          messageContent = {
            subject: aiMessage.subject,
            body: aiMessage.body,
            isAIGenerated: aiMessage.isAIGenerated,
          }
        } catch (e) {
          messageContent = {
            subject: generateEmailSubject(task.title, tone, reminderCount),
            body: customMessage || `Reminder about task: ${task.title}`,
            isAIGenerated: false,
          }
        }
      } else {
        messageContent = {
          subject: generateEmailSubject(task.title, tone, reminderCount),
          body: customMessage || `Reminder about task: ${task.title}`,
          isAIGenerated: false,
        }
      }

      // Generate email HTML
      const emailHtml = generateReminderEmailHTML({
        recipientName: task.assigneeName,
        taskTitle: task.title,
        taskDescription: task.description,
        deadline: formatDate(task.deadline),
        priority: task.priority,
        daysRemaining,
        reminderCount,
        tone,
        customMessage,
        appUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/tasks/${task._id}`,
      })

      // Send email
      const emailResult = await sendEmail({
        to: task.assigneeEmail,
        subject: messageContent.subject,
        html: emailHtml,
      })

      // Create reminder log
      await ReminderLog.create({
        taskId: task._id,
        taskTitle: task.title,
        recipientEmail: task.assigneeEmail,
        recipientName: task.assigneeName,
        channel: 'email',
        messageType: 'manual',
        tone,
        subject: messageContent.subject,
        message: messageContent.body,
        isAIGenerated: messageContent.isAIGenerated,
        status: emailResult.success ? 'sent' : 'failed',
        errorMessage: emailResult.error,
        sentAt: emailResult.success ? new Date() : undefined,
        reminderNumber: reminderCount,
        createdBy: authUser.userId,
      })

      // Update task
      await Task.findByIdAndUpdate(task._id, {
        $inc: { reminderCount: 1 },
        $set: { lastReminderSent: new Date() },
      })

      results.push({
        taskId: task._id,
        taskTitle: task.title,
        assignee: task.assigneeEmail,
        success: emailResult.success,
        error: emailResult.error,
      })
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        sent: successCount,
        failed: failCount,
      },
      results,
    })
  } catch (error: any) {
    console.error('Bulk reminder error:', error)
    return NextResponse.json({ error: 'Failed to send bulk reminders' }, { status: 500 })
  }
}
