import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'

export const dynamic = 'force-dynamic'
import User from '@/models/User'
import AutomationRule from '@/models/AutomationRule'
import ReminderLog from '@/models/ReminderLog'
import { sendEmail } from '@/lib/email'
import { generateReminderMessage } from '@/services/ai'

// This endpoint runs all automation rules
// Should be called by Boltic webhook daily

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('x-cron-secret')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get all active automation rules
    const rules = await AutomationRule.find({ isActive: true })
    
    console.log(`🤖 Running ${rules.length} automation rules`)

    const results = {
      rulesProcessed: rules.length,
      tasksMatched: 0,
      remindersSent: 0,
      errors: [] as string[]
    }

    for (const rule of rules) {
      try {
        let matchingTasks: any[] = []

        switch (rule.trigger.type) {
          case 'deadline_approaching': {
            // Find tasks with deadline within X days (including tasks due sooner)
            const daysBeforeDeadline = rule.trigger.conditions?.days || 3
            const targetDate = new Date(today)
            targetDate.setDate(targetDate.getDate() + daysBeforeDeadline)
            targetDate.setHours(23, 59, 59, 999) // End of that day

            // Find tasks where deadline is within the threshold AND hasn't been reminded today
            const todayStart = new Date(today)
            todayStart.setHours(0, 0, 0, 0)
            
            matchingTasks = await Task.find({
              createdBy: rule.createdBy,
              deadline: { $gt: todayStart, $lte: targetDate },
              status: { $nin: ['completed', 'overdue'] },
              $or: [
                { lastReminderSent: { $lt: todayStart } },
                { lastReminderSent: { $exists: false } },
                { lastReminderSent: null }
              ]
            })
            break
          }

          case 'task_overdue': {
            // Find overdue tasks
            matchingTasks = await Task.find({
              createdBy: rule.createdBy,
              deadline: { $lt: today },
              status: 'overdue'
            })
            break
          }

          case 'no_response': {
            // Find tasks where last reminder was X days ago
            const daysAfterReminder = rule.trigger.conditions?.days || 2
            const reminderCutoff = new Date(today)
            reminderCutoff.setDate(reminderCutoff.getDate() - daysAfterReminder)

            matchingTasks = await Task.find({
              createdBy: rule.createdBy,
              lastReminderSent: { $lt: reminderCutoff },
              reminderCount: { $gt: 0 },
              status: { $nin: ['completed'] }
            })
            break
          }

          case 'reminder_count': {
            // Find tasks with X or more reminders
            const reminderThreshold = rule.trigger.conditions?.count || 3
            matchingTasks = await Task.find({
              createdBy: rule.createdBy,
              reminderCount: { $gte: reminderThreshold },
              status: { $nin: ['completed'] }
            })
            break
          }
        }

        results.tasksMatched += matchingTasks.length
        console.log(`📋 Rule "${rule.name}": ${matchingTasks.length} tasks matched`)

        // Execute actions for matching tasks
        for (const task of matchingTasks) {
          for (const action of rule.actions) {
            if (action.type === 'send_reminder') {
              const user = task.createdBy as any
              
              // Generate AI reminder
              let emailContent = ''
              try {
                const daysRemaining = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                const aiMessage = await generateReminderMessage({
                  recipientName: task.assigneeName,
                  taskTitle: task.title,
                  taskDescription: task.description,
                  deadline: new Date(task.deadline).toLocaleDateString(),
                  priority: task.priority,
                  daysRemaining,
                  reminderCount: task.reminderCount + 1,
                })
                emailContent = aiMessage.body
              } catch {
                emailContent = `
                  <p>This is a reminder for your task: <strong>${task.title}</strong></p>
                  <p>Deadline: ${new Date(task.deadline).toLocaleDateString()}</p>
                  <p>Please take action soon.</p>
                `
              }

              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Automated Reminder</h1>
                    <p style="color: #dbeafe; margin: 10px 0 0 0;">Rule: ${rule.name}</p>
                  </div>
                  
                  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    ${emailContent}
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/tasks/${task._id}" 
                       style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
                      View Task
                    </a>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="color: #9ca3af; font-size: 12px;">
                      Automated by Chaser Agent
                    </p>
                  </div>
                </div>
              `

              // Send to assignee
              await sendEmail({
                to: task.assigneeEmail,
                subject: `🔔 Reminder: ${task.title}`,
                html: emailHtml
              })

              // Update task reminder count
              await Task.findByIdAndUpdate(task._id, {
                $inc: { reminderCount: 1 },
                lastReminderSent: new Date()
              })

              results.remindersSent++
              console.log(`📧 Auto-reminder sent for task: ${task.title}`)
            }

            if (action.type === 'mark_urgent') {
              await Task.findByIdAndUpdate(task._id, {
                priority: 'high'
              })
              console.log(`🔴 Task marked urgent: ${task.title}`)
            }

            if (action.type === 'send_escalation') {
              const user = task.createdBy as any
              if (user?.email) {
                await sendEmail({
                  to: user.email,
                  subject: `🚨 Escalation: ${task.title} needs attention!`,
                  html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                      <h2 style="color: #dc2626;">🚨 Task Escalation Alert</h2>
                      <p>Task <strong>${task.title}</strong> requires your immediate attention.</p>
                      <p>Assigned to: ${task.assigneeName}</p>
                      <p>Reminders sent: ${task.reminderCount}</p>
                    </div>
                  `
                })
                results.remindersSent++
                console.log(`🚨 Escalation sent for task: ${task.title}`)
              }
            }
          }
        }

      } catch (error: any) {
        console.error(`Error processing rule ${rule.name}:`, error)
        results.errors.push(`Rule ${rule.name}: ${error.message}`)
      }
    }

    console.log(`✅ Automation complete: ${results.remindersSent} reminders sent`)

    return NextResponse.json({
      success: true,
      message: 'Automation rules executed',
      results
    })

  } catch (error: any) {
    console.error('Automation error:', error)
    return NextResponse.json(
      { error: 'Failed to run automation', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
