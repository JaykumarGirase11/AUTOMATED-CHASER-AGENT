import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import { getAuthUser } from '@/lib/auth'
import { updateTaskSchema } from '@/lib/validations'
import { getDaysUntilDeadline } from '@/lib/utils'
import { notifyTaskUpdated } from '@/services/boltic'

// GET - Fetch a single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = await params

    const task = await Task.findOne({
      _id: id,
      createdBy: authUser.userId,
    }).lean()

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
      task: {
        ...task,
        daysRemaining: getDaysUntilDeadline(task.deadline),
      },
    })
  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PATCH - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validatedData = updateTaskSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    // Find task first
    const existingTask = await Task.findOne({
      _id: id,
      createdBy: authUser.userId,
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { ...validatedData.data }
    
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline)
    }

    // If marking as completed, set completedAt
    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      updateData.completedAt = new Date()
    }

    // Update task
    const task = await Task.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    // Trigger Boltic workflow for task update
    try {
      await notifyTaskUpdated(
        task._id.toString(),
        task.title,
        task.assigneeName,
        task.assigneeEmail,
        task.deadline.toISOString(),
        task.priority,
        task.status,
        getDaysUntilDeadline(task.deadline),
        task.reminderCount
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
    })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { id } = await params

    const task = await Task.findOneAndDelete({
      _id: id,
      createdBy: authUser.userId,
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
