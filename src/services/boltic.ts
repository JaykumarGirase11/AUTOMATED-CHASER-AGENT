import axios from 'axios'

const BOLTIC_WEBHOOK_URL = process.env.BOLTIC_WEBHOOK_URL

export interface BolticPayload {
  event: 'task_created' | 'task_updated' | 'reminder_scheduled' | 'reminder_triggered' | 'manual_nudge'
  taskId: string
  taskTitle: string
  assigneeName: string
  assigneeEmail: string
  deadline: string
  priority: string
  status: string
  daysRemaining: number
  reminderCount: number
  customMessage?: string
  triggeredBy?: string
  timestamp: string
}

export async function triggerBolticWorkflow(payload: BolticPayload): Promise<{ success: boolean; error?: string }> {
  if (!BOLTIC_WEBHOOK_URL) {
    console.warn('⚠️ Boltic webhook URL not configured')
    return { success: false, error: 'Boltic webhook URL not configured' }
  }

  try {
    const response = await axios.post(BOLTIC_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    console.log('✅ Boltic workflow triggered:', response.status)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Boltic webhook error:', error.message)
    return { success: false, error: error.message }
  }
}

export async function scheduleReminder(
  taskId: string,
  taskTitle: string,
  assigneeName: string,
  assigneeEmail: string,
  deadline: string,
  priority: string,
  daysRemaining: number,
  reminderCount: number
): Promise<{ success: boolean; error?: string }> {
  const payload: BolticPayload = {
    event: 'reminder_scheduled',
    taskId,
    taskTitle,
    assigneeName,
    assigneeEmail,
    deadline,
    priority,
    status: 'scheduled',
    daysRemaining,
    reminderCount,
    timestamp: new Date().toISOString(),
  }

  return triggerBolticWorkflow(payload)
}

export async function triggerManualNudge(
  taskId: string,
  taskTitle: string,
  assigneeName: string,
  assigneeEmail: string,
  deadline: string,
  priority: string,
  status: string,
  daysRemaining: number,
  reminderCount: number,
  customMessage?: string,
  triggeredBy?: string
): Promise<{ success: boolean; error?: string }> {
  const payload: BolticPayload = {
    event: 'manual_nudge',
    taskId,
    taskTitle,
    assigneeName,
    assigneeEmail,
    deadline,
    priority,
    status,
    daysRemaining,
    reminderCount,
    customMessage,
    triggeredBy,
    timestamp: new Date().toISOString(),
  }

  return triggerBolticWorkflow(payload)
}

export async function notifyTaskCreated(
  taskId: string,
  taskTitle: string,
  assigneeName: string,
  assigneeEmail: string,
  deadline: string,
  priority: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const payload: BolticPayload = {
    event: 'task_created',
    taskId,
    taskTitle,
    assigneeName,
    assigneeEmail,
    deadline,
    priority,
    status: 'todo',
    daysRemaining,
    reminderCount: 0,
    timestamp: new Date().toISOString(),
  }

  return triggerBolticWorkflow(payload)
}

export async function notifyTaskUpdated(
  taskId: string,
  taskTitle: string,
  assigneeName: string,
  assigneeEmail: string,
  deadline: string,
  priority: string,
  status: string,
  daysRemaining: number,
  reminderCount: number
): Promise<{ success: boolean; error?: string }> {
  const payload: BolticPayload = {
    event: 'task_updated',
    taskId,
    taskTitle,
    assigneeName,
    assigneeEmail,
    deadline,
    priority,
    status,
    daysRemaining,
    reminderCount,
    timestamp: new Date().toISOString(),
  }

  return triggerBolticWorkflow(payload)
}

// Slack webhook integration (bonus feature)
export async function sendSlackNotification(
  webhookUrl: string,
  message: {
    title: string
    text: string
    color?: string
    taskUrl?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      attachments: [
        {
          color: message.color || '#3b82f6',
          title: message.title,
          text: message.text,
          footer: 'Automated Chaser Agent',
          ts: Math.floor(Date.now() / 1000),
          actions: message.taskUrl ? [
            {
              type: 'button',
              text: 'View Task',
              url: message.taskUrl,
            },
          ] : undefined,
        },
      ],
    }

    await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
