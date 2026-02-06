import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import ReminderLog from '@/models/ReminderLog'
import { getAuthUser } from '@/lib/auth'
import { getDaysUntilDeadline, getReminderTone, formatDate } from '@/lib/utils'
import { generateReminderMessage } from '@/services/ai'
import { sendEmail, generateReminderEmailHTML, generateEmailSubject } from '@/services/email'
import { triggerManualNudge } from '@/services/boltic'

// POST - Send a manual reminder (nudge) for a task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = await params
    const body = await request.json()
    const { customMessage, useAI = true } = body

    // Get task
    const task = await Task.findOne({
      _id: id,
      createdBy: authUser.userId,
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const daysRemaining = getDaysUntilDeadline(task.deadline)
    const reminderCount = task.reminderCount + 1
    const tone = getReminderTone(reminderCount, daysRemaining)

    let messageContent: { subject: string; body: string; isAIGenerated: boolean }

    // Generate message (AI or template)
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
        // Fallback to template
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
    const reminderLog = await ReminderLog.create({
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

    // Update task reminder count
    await Task.findByIdAndUpdate(id, {
      $inc: { reminderCount: 1 },
      $set: { lastReminderSent: new Date() },
    })

    // Trigger Boltic webhook
    try {
      await triggerManualNudge(
        task._id.toString(),
        task.title,
        task.assigneeName,
        task.assigneeEmail,
        task.deadline.toISOString(),
        task.priority,
        task.status,
        daysRemaining,
        reminderCount,
        customMessage,
        authUser.name
      )
    } catch (e) {
      console.log('Boltic trigger failed (non-blocking):', e)
    }

    return NextResponse.json({
      success: true,
      reminder: {
        id: reminderLog._id,
        status: emailResult.success ? 'sent' : 'failed',
        isAIGenerated: messageContent.isAIGenerated,
        tone,
        subject: messageContent.subject,
        sentAt: reminderLog.sentAt,
      },
    })
  } catch (error: any) {
    console.error('Send reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 })
  }
}
