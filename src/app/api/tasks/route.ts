import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'

export const dynamic = 'force-dynamic'
import { getAuthUser } from '@/lib/auth'
import { taskSchema } from '@/lib/validations'
import { getDaysUntilDeadline } from '@/lib/utils'
import { notifyTaskCreated } from '@/services/boltic'

// GET - Fetch all tasks for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'deadline'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Build query
    const query: any = { createdBy: authUser.userId }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assigneeName: { $regex: search, $options: 'i' } },
      ]
    }

    // Check and update overdue tasks
    const now = new Date()
    await Task.updateMany(
      {
        createdBy: authUser.userId,
        status: { $nin: ['completed', 'overdue'] },
        deadline: { $lt: now },
      },
      { $set: { status: 'overdue' } }
    )

    // Fetch tasks with sorting
    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1

    const tasks = await Task.find(query)
      .sort(sortOptions)
      .lean()

    // Add computed fields
    const tasksWithComputed = tasks.map(task => ({
      ...task,
      daysRemaining: getDaysUntilDeadline(task.deadline),
    }))

    return NextResponse.json({ tasks: tasksWithComputed })
  } catch (error: any) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()
    
    // Validate input
    const validatedData = taskSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, assigneeName, assigneeEmail, deadline, priority, status, tags, category } = validatedData.data

    // Create task
    const task = await Task.create({
      title,
      description,
      assigneeName,
      assigneeEmail,
      deadline: new Date(deadline),
      priority,
      status: status || 'todo',
      tags: tags || [],
      category,
      createdBy: authUser.userId,
      reminderCount: 0,
    })

    // Trigger Boltic workflow for task creation
    try {
      await notifyTaskCreated(
        task._id.toString(),
        task.title,
        task.assigneeName,
        task.assigneeEmail,
        task.deadline.toISOString(),
        task.priority
      )
    } catch (e) {
      console.log('Boltic notification failed (non-blocking):', e)
    }

    return NextResponse.json({
      success: true,
      task: {
        ...task.toObject(),
        daysRemaining: getDaysUntilDeadline(task.deadline),
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
