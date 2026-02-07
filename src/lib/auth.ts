import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import dbConnect from '@/lib/db'
import User from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET!

export interface TokenPayload {
  userId: string
  email: string
  name: string
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function getAuthUser(): Promise<TokenPayload | null> {
  // First check custom auth_token (OTP login)
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (token) {
    const payload = verifyToken(token)
    if (payload) return payload
  }
  
  // Then check NextAuth session (Google login)
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      // Get actual MongoDB user ID
      await dbConnect()
      const dbUser = await User.findOne({ email: session.user.email })
      
      if (dbUser) {
        return {
          userId: dbUser._id.toString(),
          email: session.user.email,
          name: session.user.name || dbUser.name || '',
        }
      }
    }
  } catch (error) {
    console.error('Error getting NextAuth session:', error)
  }
  
  return null
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}
