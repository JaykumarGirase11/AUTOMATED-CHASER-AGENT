import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import OTP from '@/models/OTP'

export const dynamic = 'force-dynamic'
import { z } from 'zod'

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['registration', 'login', 'password-reset']).default('registration'),
})

// POST - Verify OTP
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const validation = verifyOTPSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, otp, purpose } = validation.data

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email,
      purpose,
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

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
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

    // Mark OTP as verified
    await OTP.updateOne(
      { _id: otpRecord._id },
      { verified: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      verified: true,
    })
  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
