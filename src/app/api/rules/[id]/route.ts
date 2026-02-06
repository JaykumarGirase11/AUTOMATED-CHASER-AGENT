import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import AutomationRule from '@/models/AutomationRule'
import { getAuthUser } from '@/lib/auth'
import { automationRuleSchema } from '@/lib/validations'

// GET - Get a single rule
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

    const rule = await AutomationRule.findOne({
      _id: id,
      createdBy: authUser.userId,
    }).lean()

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('Get rule error:', error)
    return NextResponse.json({ error: 'Failed to fetch rule' }, { status: 500 })
  }
}

// PATCH - Update a rule
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
    const validatedData = automationRuleSchema.partial().safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const rule = await AutomationRule.findOneAndUpdate(
      { _id: id, createdBy: authUser.userId },
      { $set: validatedData.data },
      { new: true }
    )

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, rule })
  } catch (error) {
    console.error('Update rule error:', error)
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
  }
}

// DELETE - Delete a rule
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

    const rule = await AutomationRule.findOneAndDelete({
      _id: id,
      createdBy: authUser.userId,
    })

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Rule deleted' })
  } catch (error) {
    console.error('Delete rule error:', error)
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
  }
}
