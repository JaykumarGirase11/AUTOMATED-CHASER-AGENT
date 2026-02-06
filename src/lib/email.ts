import nodemailer from 'nodemailer'

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured')
      return { 
        success: false, 
        error: 'Email credentials not configured. Please add EMAIL_USER and EMAIL_PASS to .env.local' 
      }
    }

    const transporter = createTransporter()

    const mailOptions = {
      from: `"Chaser Agent 🔔" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Failed to send email:', error)
    return { success: false, error: error.message }
  }
}

// Send task reminder email
export async function sendTaskReminder(
  assigneeEmail: string,
  assigneeName: string,
  taskTitle: string,
  deadline: Date,
  message: string,
  isAIGenerated: boolean = false
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const formattedDeadline = new Date(deadline).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const daysRemaining = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const urgencyColor = daysRemaining <= 1 ? '#ef4444' : daysRemaining <= 3 ? '#f59e0b' : '#3b82f6'
  const urgencyText = daysRemaining <= 0 ? 'OVERDUE!' : daysRemaining === 1 ? '1 day left' : `${daysRemaining} days left`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Task Reminder</h1>
            ${isAIGenerated ? '<p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 12px;">✨ AI-Powered Message</p>' : ''}
          </td>
        </tr>
        
        <!-- Greeting -->
        <tr>
          <td style="padding: 30px 30px 20px;">
            <h2 style="color: #1f2937; margin: 0 0 10px; font-size: 20px;">Hi ${assigneeName}! 👋</h2>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">This is a friendly reminder about your pending task.</p>
          </td>
        </tr>
        
        <!-- Task Card -->
        <tr>
          <td style="padding: 0 30px 20px;">
            <table width="100%" style="background-color: #f9fafb; border-radius: 12px; border-left: 4px solid ${urgencyColor};">
              <tr>
                <td style="padding: 20px;">
                  <h3 style="color: #1f2937; margin: 0 0 10px; font-size: 18px;">📋 ${taskTitle}</h3>
                  <table width="100%">
                    <tr>
                      <td style="padding: 5px 0;">
                        <span style="color: #6b7280; font-size: 13px;">📅 Deadline:</span>
                        <span style="color: #1f2937; font-size: 13px; font-weight: 600;"> ${formattedDeadline}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0;">
                        <span style="background-color: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                          ⏰ ${urgencyText}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <!-- Message -->
        <tr>
          <td style="padding: 0 30px 30px;">
            <div style="background-color: #eff6ff; border-radius: 12px; padding: 20px;">
              <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
                ${message}
              </p>
            </div>
          </td>
        </tr>
        
        <!-- CTA Button -->
        <tr>
          <td style="padding: 0 30px 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/tasks" 
               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              View Task Details →
            </a>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              Sent by <strong>Automated Chaser Agent</strong> 🚀
            </p>
            <p style="color: #9ca3af; margin: 5px 0 0; font-size: 11px;">
              This is an automated reminder. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `
Hi ${assigneeName}!

This is a reminder about your pending task.

Task: ${taskTitle}
Deadline: ${formattedDeadline}
Status: ${urgencyText}

${message}

View your task at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/tasks

---
Sent by Automated Chaser Agent 🔔
  `.trim()

  return sendEmail({
    to: assigneeEmail,
    subject: `🔔 Reminder: ${taskTitle} - ${urgencyText}`,
    text,
    html,
  })
}

// Test email connection
export async function testEmailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, error: 'Email credentials not configured' }
    }

    const transporter = createTransporter()
    await transporter.verify()
    
    console.log('Email connection verified successfully')
    return { success: true }
  } catch (error: any) {
    console.error('Email connection failed:', error)
    return { success: false, error: error.message }
  }
}
