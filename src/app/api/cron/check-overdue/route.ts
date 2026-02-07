import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'

export const dynamic = 'force-dynamic'
import User from '@/models/User'
import { sendEmail } from '@/lib/email'

// This endpoint should be called by a cron job (Boltic webhook) daily
// It checks all tasks and marks overdue ones + sends notification

export async function GET(request: NextRequest) {
  try {
    // Optional: Add a secret key check for security
    const authHeader = request.headers.get('x-cron-secret')
    const cronSecret = process.env.CRON_SECRET
    
    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all tasks where:
    // - deadline < today (past deadline)
    // - status is NOT 'completed' or 'overdue'
    const overdueTasks = await Task.find({
      deadline: { $lt: today },
      status: { $nin: ['completed', 'overdue'] }
    }).populate('createdBy', 'name email')

    console.log(`📋 Found ${overdueTasks.length} tasks that are now overdue`)

    const results = {
      total: overdueTasks.length,
      updated: 0,
      emailsSent: 0,
      errors: [] as string[]
    }

    for (const task of overdueTasks) {
      try {
        // Update task status to overdue
        await Task.findByIdAndUpdate(task._id, { 
          status: 'overdue',
          updatedAt: new Date()
        })
        results.updated++

        // Get user info
        const user = task.createdBy as any
        
        // Calculate how many days overdue
        const deadlineDate = new Date(task.deadline)
        const daysOverdue = Math.floor((today.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24))

        // Send email notification to task owner
        if (user?.email) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Task Overdue Alert!</h1>
              </div>
              
              <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="color: #374151; font-size: 16px;">Hi ${user.name || 'there'},</p>
                
                <p style="color: #374151; font-size: 16px;">
                  The following task has <strong style="color: #ef4444;">passed its deadline</strong> and is now ${daysOverdue} day(s) overdue:
                </p>
                
                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #991b1b; margin: 0 0 10px 0;">${task.title}</h3>
                  <p style="color: #7f1d1d; margin: 5px 0;"><strong>Assignee:</strong> ${task.assigneeName}</p>
                  <p style="color: #7f1d1d; margin: 5px 0;"><strong>Deadline was:</strong> ${deadlineDate.toLocaleDateString('en-IN', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p style="color: #7f1d1d; margin: 5px 0;"><strong>Days Overdue:</strong> ${daysOverdue} day(s)</p>
                </div>
                
                <p style="color: #374151; font-size: 16px;">
                  Please take immediate action on this task or update its status.
                </p>
                
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/tasks/${task._id}" 
                   style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
                  View Task Details
                </a>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px;">
                  This is an automated notification from Chaser Agent.
                </p>
              </div>
            </div>
          `

          await sendEmail({
            to: user.email,
            subject: `⚠️ OVERDUE: "${task.title}" - Action Required!`,
            html: emailHtml
          })
          results.emailsSent++
          console.log(`📧 Overdue notification sent to ${user.email} for task: ${task.title}`)
        }

        // Also send to assignee
        if (task.assigneeEmail && task.assigneeEmail !== user?.email) {
          const assigneeEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Your Task is Overdue!</h1>
              </div>
              
              <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="color: #374151; font-size: 16px;">Hi ${task.assigneeName},</p>
                
                <p style="color: #374151; font-size: 16px;">
                  Your assigned task has <strong style="color: #ef4444;">passed its deadline</strong>:
                </p>
                
                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #991b1b; margin: 0 0 10px 0;">${task.title}</h3>
                  <p style="color: #7f1d1d; margin: 5px 0;"><strong>Deadline was:</strong> ${deadlineDate.toLocaleDateString('en-IN', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p style="color: #7f1d1d; margin: 5px 0;"><strong>Days Overdue:</strong> ${daysOverdue} day(s)</p>
                </div>
                
                <p style="color: #374151; font-size: 16px;">
                  Please complete this task as soon as possible or contact your manager.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px;">
                  This is an automated notification from Chaser Agent.
                </p>
              </div>
            </div>
          `

          await sendEmail({
            to: task.assigneeEmail,
            subject: `⚠️ OVERDUE: "${task.title}" - Please Complete ASAP!`,
            html: assigneeEmailHtml
          })
          results.emailsSent++
          console.log(`📧 Overdue notification sent to assignee ${task.assigneeEmail}`)
        }

      } catch (error: any) {
        console.error(`Error processing task ${task._id}:`, error)
        results.errors.push(`Task ${task._id}: ${error.message}`)
      }
    }

    console.log(`✅ Overdue check complete: ${results.updated} tasks updated, ${results.emailsSent} emails sent`)

    return NextResponse.json({
      success: true,
      message: 'Overdue check completed',
      results
    })

  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to check overdue tasks', details: error.message },
      { status: 500 }
    )
  }
}

// Also support POST for Boltic webhooks
export async function POST(request: NextRequest) {
  return GET(request)
}
