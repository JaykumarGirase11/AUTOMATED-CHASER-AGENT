import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import OTP from '@/models/OTP'
import User from '@/models/User'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const sendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.enum(['registration', 'login', 'password-reset']).default('registration'),
})

// POST - Send OTP
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validation = sendOTPSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, purpose } = validation.data
    let isNewUser = false

    // For registration, check if user already exists
    if (purpose === 'registration') {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered. Please login.' },
          { status: 400 }
        )
      }
    }

    // For login, check if user exists (new user = auto register)
    if (purpose === 'login') {
      const existingUser = await User.findOne({ email })
      isNewUser = !existingUser
    }

    // For password-reset, user must exist
    if (purpose === 'password-reset') {
      const existingUser = await User.findOne({ email })
      if (!existingUser) {
        return NextResponse.json(
          { error: 'Email not registered. Please sign up first.' },
          { status: 400 }
        )
      }
    }

    // Delete any existing OTPs for this email and purpose
    await OTP.deleteMany({ email, purpose })

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      purpose,
      expiresAt,
    })

    // Send OTP via email
    const emailResult = await sendEmail({
      to: email,
      subject: `🔐 Your Verification Code: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Chaser Agent</h1>
              </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #1f2937; margin: 0 0 10px; font-size: 20px;">Verification Code</h2>
                <p style="color: #6b7280; margin: 0 0 30px; font-size: 14px;">
                  Use this code to ${purpose === 'registration' ? 'complete your registration' : purpose === 'login' ? 'login to your account' : 'reset your password'}
                </p>
                
                <!-- OTP Box -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 12px; padding: 20px; display: inline-block;">
                  <span style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
                    ${otp}
                  </span>
                </div>
                
                <p style="color: #9ca3af; margin: 30px 0 0; font-size: 12px;">
                  ⏰ This code expires in <strong>10 minutes</strong>
                </p>
                <p style="color: #9ca3af; margin: 10px 0 0; font-size: 12px;">
                  If you didn't request this code, please ignore this email.
                </p>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; margin: 0; font-size: 11px;">
                  Sent by <strong>Automated Chaser Agent</strong> 🚀
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    })

    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: 600, // 10 minutes in seconds
      isNewUser, // Tell frontend if this is a new user
    })
  } catch (error: any) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
