import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import ReminderLog from '@/models/ReminderLog'
import { getAuthUser } from '@/lib/auth'

// GET - Fetch reminder history logs
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const status = searchParams.get('status')
    const channel = searchParams.get('channel')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build query
    const query: any = { createdBy: authUser.userId }

    if (taskId) {
      query.taskId = taskId
    }

    if (status && status !== 'all') {
      query.status = status
    }

    if (channel && channel !== 'all') {
      query.channel = channel
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    // Get total count
    const total = await ReminderLog.countDocuments(query)

    // Fetch logs with pagination
    const logs = await ReminderLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get reminder logs error:', error)
    return NextResponse.json({ error: 'Failed to fetch reminder logs' }, { status: 500 })
  }
}
