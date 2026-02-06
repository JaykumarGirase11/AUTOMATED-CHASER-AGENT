import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { createToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = validatedData.data

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    })

    // Create JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    // Set auth cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
