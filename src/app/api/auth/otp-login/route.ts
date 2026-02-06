import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import OTP from '@/models/OTP'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'chaser-agent-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    // Validation
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose: 'login',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id })
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new OTP.' },
        { status: 400 }
      )
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await OTP.updateOne(
        { _id: otpRecord._id },
        { $inc: { attempts: 1 } }
      )
      return NextResponse.json(
        { error: `Invalid OTP. ${4 - otpRecord.attempts} attempts remaining.` },
        { status: 400 }
      )
    }

    // OTP verified! Delete it
    await OTP.deleteOne({ _id: otpRecord._id })

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() })
    let isNewUser = false

    if (!user) {
      // Create new user (no password needed for OTP login)
      isNewUser = true
      const name = email.split('@')[0] // Use email prefix as name
      
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: '', // Empty password - user logged in via OTP
        emailVerified: true
      })

      console.log(`✅ New user created via OTP login: ${email}`)
    } else {
      // Update emailVerified if not already
      if (!user.emailVerified) {
        await User.updateOne(
          { _id: user._id },
          { emailVerified: true }
        )
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        name: user.name 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    console.log(`✅ User logged in via OTP: ${email} (New: ${isNewUser})`)

    return NextResponse.json({
      success: true,
      isNewUser,
      message: isNewUser ? 'Account created successfully!' : 'Logged in successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error('OTP Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
