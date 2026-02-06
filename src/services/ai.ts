import Groq from 'groq-sdk'
import { getReminderTone } from '@/lib/utils'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface MessageContext {
  recipientName: string
  taskTitle: string
  taskDescription?: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  daysRemaining: number
  reminderCount: number
  previousReminders?: string[]
}

export interface GeneratedMessage {
  subject: string
  body: string
  tone: 'friendly' | 'firm' | 'urgent' | 'escalation'
  isAIGenerated: boolean
}

export async function generateReminderMessage(context: MessageContext): Promise<GeneratedMessage> {
  const tone = getReminderTone(context.reminderCount, context.daysRemaining)
  
  const prompt = `You are an intelligent task reminder assistant. Generate a professional yet personalized reminder message.

Context:
- Recipient: ${context.recipientName}
- Task: ${context.taskTitle}
- Description: ${context.taskDescription || 'No description provided'}
- Deadline: ${context.deadline}
- Priority: ${context.priority}
- Days remaining: ${context.daysRemaining} (${context.daysRemaining < 0 ? 'OVERDUE' : context.daysRemaining === 0 ? 'DUE TODAY' : 'upcoming'})
- This is reminder #${context.reminderCount}
- Required tone: ${tone}

Tone Guidelines:
- friendly: Warm, supportive, offering help
- firm: Professional, clear expectations, slightly urgent
- urgent: Very urgent, emphasizing importance and consequences
- escalation: Critical, this is overdue, immediate action required

Generate a reminder message following these rules:
1. Address the recipient by first name
2. Be concise (max 3-4 sentences for body)
3. Include specific task details
4. Match the tone exactly
5. End with a clear call to action
6. For escalation, mention this may need to be escalated to management

Respond in this exact JSON format:
{
  "subject": "Email subject line",
  "body": "The email body message"
}`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content)
    
    return {
      subject: parsed.subject,
      body: parsed.body,
      tone,
      isAIGenerated: true,
    }
  } catch (error) {
    console.error('AI generation failed, using fallback:', error)
    return generateFallbackMessage(context, tone)
  }
}

function generateFallbackMessage(context: MessageContext, tone: 'friendly' | 'firm' | 'urgent' | 'escalation'): GeneratedMessage {
  const firstName = context.recipientName.split(' ')[0]
  
  const templates = {
    friendly: {
      subject: `👋 Friendly Reminder: ${context.taskTitle}`,
      body: `Hi ${firstName},\n\nThis is a friendly reminder that your task "${context.taskTitle}" is due ${context.daysRemaining === 0 ? 'today' : `in ${context.daysRemaining} days`}.\n\nPlease let me know if you need any help or have questions!\n\nBest regards`,
    },
    firm: {
      subject: `⏰ Action Required: ${context.taskTitle}`,
      body: `Hi ${firstName},\n\nThis is a reminder that "${context.taskTitle}" requires your attention. The deadline is ${context.deadline}.\n\nPlease update the task status or reach out if you're facing any blockers.\n\nThank you`,
    },
    urgent: {
      subject: `🚨 URGENT: ${context.taskTitle} - Immediate Action Required`,
      body: `Hi ${firstName},\n\nThis is an urgent reminder about "${context.taskTitle}". The deadline is ${context.daysRemaining <= 0 ? 'today' : 'approaching very soon'}.\n\nThis is a ${context.priority} priority task and requires immediate attention. Please take action now or escalate if you're blocked.\n\nThank you`,
    },
    escalation: {
      subject: `🔴 OVERDUE: ${context.taskTitle} - Escalation Required`,
      body: `Hi ${firstName},\n\n"${context.taskTitle}" is now ${Math.abs(context.daysRemaining)} days overdue. This is reminder #${context.reminderCount}.\n\nImmediate action is required. If you're unable to complete this task, please escalate to your manager immediately.\n\nThis matter will be escalated if not addressed today.`,
    },
  }

  return {
    ...templates[tone],
    tone,
    isAIGenerated: false,
  }
}

export async function generateCustomNudge(
  recipientName: string,
  taskTitle: string,
  senderNote?: string
): Promise<string> {
  const firstName = recipientName.split(' ')[0]
  
  const prompt = `Generate a brief, friendly nudge message for ${firstName} about their task "${taskTitle}".
${senderNote ? `The sender added this note: "${senderNote}"` : ''}

Make it casual, friendly, and encouraging. Keep it under 2 sentences.
Return just the message text, no JSON.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.8,
      max_tokens: 150,
    })

    return completion.choices[0]?.message?.content || 
      `Hey ${firstName}! Just checking in on "${taskTitle}". Let me know if you need anything! 👋`
  } catch (error) {
    return `Hey ${firstName}! Quick reminder about "${taskTitle}". Let me know if you need any help! 👋`
  }
}

export async function analyzeDelayRisk(
  taskTitle: string,
  description: string,
  daysUntilDeadline: number,
  assigneeHistory: { totalTasks: number; delayedTasks: number }
): Promise<{ riskScore: number; reasons: string[] }> {
  const historyRisk = assigneeHistory.totalTasks > 0 
    ? (assigneeHistory.delayedTasks / assigneeHistory.totalTasks) * 30 
    : 0

  const timeRisk = daysUntilDeadline <= 1 ? 30 : daysUntilDeadline <= 3 ? 15 : 5

  // Complexity keywords
  const complexityKeywords = ['integration', 'migration', 'refactor', 'complex', 'multiple', 'system', 'architecture']
  const hasComplexity = complexityKeywords.some(kw => 
    taskTitle.toLowerCase().includes(kw) || description?.toLowerCase().includes(kw)
  )
  const complexityRisk = hasComplexity ? 25 : 0

  const totalRisk = Math.min(100, Math.round(historyRisk + timeRisk + complexityRisk))

  const reasons: string[] = []
  if (historyRisk > 15) reasons.push('Assignee has history of delays')
  if (timeRisk >= 30) reasons.push('Deadline is very close')
  if (hasComplexity) reasons.push('Task appears complex based on description')
  if (daysUntilDeadline <= 0) reasons.push('Task is already overdue')

  return { riskScore: totalRisk, reasons }
}
