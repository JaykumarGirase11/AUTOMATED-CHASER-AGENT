import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import OTP from '@/models/OTP'

export const dynamic = 'force-dynamic'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

// POST - Reset Password
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, otp, newPassword } = validation.data

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email,
      purpose: 'password-reset',
      verified: false,
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      )
      
      const remainingAttempts = 5 - (otpRecord.attempts + 1)
      return NextResponse.json(
        { error: `Invalid verification code. ${remainingAttempts} attempts remaining.` },
        { status: 400 }
      )
    }

    // Find user and update password
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password
    await User.updateOne(
      { email },
      { password: hashedPassword }
    )

    // Delete OTP record
    await OTP.deleteOne({ _id: otpRecord._id })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
