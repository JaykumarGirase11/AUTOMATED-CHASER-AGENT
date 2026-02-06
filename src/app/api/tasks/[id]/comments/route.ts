import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'
import { getAuthUser } from '@/lib/auth'
import { commentSchema } from '@/lib/validations'

// POST - Add a comment to a task
export async function POST(
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
    const validatedData = commentSchema.safeParse({ ...body, taskId: id })
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const { content, mentions } = validatedData.data

    // Find task and add comment
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        createdBy: authUser.userId,
      },
      {
        $push: {
          comments: {
            userId: authUser.userId,
            userName: authUser.name,
            content,
            mentions: mentions || [],
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    )

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const newComment = task.comments[task.comments.length - 1]

    return NextResponse.json({
      success: true,
      comment: newComment,
    })
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}

// GET - Get all comments for a task
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
    }).select('comments')

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
      comments: task.comments.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
