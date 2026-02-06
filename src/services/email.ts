import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const info = await transporter.sendMail({
      from: `"Chaser Agent" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    })

    console.log('📧 Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Email error:', error.message)
    return { success: false, error: error.message }
  }
}

export function generateReminderEmailHTML({
  recipientName,
  taskTitle,
  taskDescription,
  deadline,
  priority,
  daysRemaining,
  reminderCount,
  tone,
  customMessage,
  appUrl,
}: {
  recipientName: string
  taskTitle: string
  taskDescription?: string
  deadline: string
  priority: string
  daysRemaining: number
  reminderCount: number
  tone: 'friendly' | 'firm' | 'urgent' | 'escalation'
  customMessage?: string
  appUrl: string
}): string {
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
  }

  const toneColors = {
    friendly: '#3b82f6',
    firm: '#f59e0b',
    urgent: '#ef4444',
    escalation: '#dc2626',
  }

  const toneEmojis = {
    friendly: '👋',
    firm: '⏰',
    urgent: '🚨',
    escalation: '🔴',
  }

  const deadlineText = daysRemaining < 0 
    ? `${Math.abs(daysRemaining)} days overdue`
    : daysRemaining === 0 
    ? 'Due today!'
    : `Due in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${toneColors[tone]} 0%, ${toneColors[tone]}dd 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">
                ${toneEmojis[tone]} Task Reminder
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                Reminder #${reminderCount}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                Hi <strong>${recipientName}</strong>,
              </p>
              
              ${customMessage ? `
              <div style="background-color: #f0f9ff; border-left: 4px solid ${toneColors[tone]}; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
                <p style="color: #1e40af; margin: 0; font-style: italic;">${customMessage}</p>
              </div>
              ` : ''}
              
              <!-- Task Card -->
              <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 20px 0;">
                <div style="background-color: #f9fafb; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                  <h2 style="margin: 0; color: #111827; font-size: 18px;">${taskTitle}</h2>
                </div>
                <div style="padding: 20px;">
                  ${taskDescription ? `
                  <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">
                    ${taskDescription}
                  </p>
                  ` : ''}
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding: 10px 0;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px; text-transform: uppercase;">Priority</p>
                        <p style="margin: 5px 0 0 0;">
                          <span style="background-color: ${priorityColors[priority as keyof typeof priorityColors]}20; color: ${priorityColors[priority as keyof typeof priorityColors]}; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: capitalize;">
                            ${priority}
                          </span>
                        </p>
                      </td>
                      <td width="50%" style="padding: 10px 0;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px; text-transform: uppercase;">Deadline</p>
                        <p style="color: ${daysRemaining < 0 ? '#ef4444' : daysRemaining === 0 ? '#f59e0b' : '#374151'}; margin: 5px 0 0 0; font-size: 14px; font-weight: 600;">
                          ${deadline}
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
                <div style="background-color: ${daysRemaining < 0 ? '#fef2f2' : daysRemaining === 0 ? '#fffbeb' : '#f0fdf4'}; padding: 15px 20px; text-align: center;">
                  <p style="margin: 0; color: ${daysRemaining < 0 ? '#dc2626' : daysRemaining === 0 ? '#d97706' : '#16a34a'}; font-weight: 600;">
                    ⏱️ ${deadlineText}
                  </p>
                </div>
              </div>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${appUrl}" style="background: linear-gradient(135deg, ${toneColors[tone]} 0%, ${toneColors[tone]}dd 100%); color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                      View Task Details →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
                Need help? Reply to this email or contact your team lead.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Sent by <strong>Automated Chaser Agent</strong> • Built for Fynd SDE Hiring Challenge
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
                This is an automated reminder. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

export function generateEmailSubject(taskTitle: string, tone: 'friendly' | 'firm' | 'urgent' | 'escalation', reminderCount: number): string {
  const prefixes = {
    friendly: '👋 Reminder:',
    firm: '⏰ Action Required:',
    urgent: '🚨 URGENT:',
    escalation: '🔴 OVERDUE:',
  }
  
  const suffix = reminderCount > 1 ? ` (Reminder #${reminderCount})` : ''
  return `${prefixes[tone]} ${taskTitle}${suffix}`
}
