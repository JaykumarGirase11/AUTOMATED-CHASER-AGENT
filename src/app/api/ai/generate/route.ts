import { NextRequest, NextResponse } from 'next/server'
import { generateReminderMessage, generateCustomNudge, analyzeDelayRisk } from '@/services/ai'
import { getAuthUser } from '@/lib/auth'

// POST - Generate AI-powered message
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...context } = body

    if (type === 'reminder') {
      const message = await generateReminderMessage({
        recipientName: context.recipientName,
        taskTitle: context.taskTitle,
        taskDescription: context.taskDescription,
        deadline: context.deadline,
        priority: context.priority,
        daysRemaining: context.daysRemaining,
        reminderCount: context.reminderCount,
      })

      return NextResponse.json({
        success: true,
        message,
      })
    }

    if (type === 'nudge') {
      const message = await generateCustomNudge(
        context.recipientName,
        context.taskTitle,
        context.senderNote
      )

      return NextResponse.json({
        success: true,
        message: {
          body: message,
          isAIGenerated: true,
        },
      })
    }

    if (type === 'analyze-risk') {
      const risk = await analyzeDelayRisk(
        context.taskTitle,
        context.description,
        context.daysUntilDeadline,
        context.assigneeHistory
      )

      return NextResponse.json({
        success: true,
        risk,
      })
    }

    return NextResponse.json(
      { error: 'Invalid type. Use: reminder, nudge, or analyze-risk' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'AI generation failed' },
      { status: 500 }
    )
  }
}
