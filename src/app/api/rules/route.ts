import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import AutomationRule from '@/models/AutomationRule'
import { getAuthUser } from '@/lib/auth'
import { automationRuleSchema } from '@/lib/validations'

// GET - Fetch all automation rules
export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const rules = await AutomationRule.find({ createdBy: authUser.userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ rules })
  } catch (error) {
    console.error('Get rules error:', error)
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 })
  }
}

// POST - Create a new automation rule
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const body = await request.json()

    // Validate input
    const validatedData = automationRuleSchema.safeParse(body)
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }

    const rule = await AutomationRule.create({
      ...validatedData.data,
      createdBy: authUser.userId,
    })

    return NextResponse.json({
      success: true,
      rule,
    }, { status: 201 })
  } catch (error) {
    console.error('Create rule error:', error)
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
  }
}

// PATCH - Update an automation rule
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    const body = await request.json()

    const rule = await AutomationRule.findOneAndUpdate(
      { _id: ruleId, createdBy: authUser.userId },
      { $set: body },
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

// DELETE - Delete an automation rule
export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    const rule = await AutomationRule.findOneAndDelete({
      _id: ruleId,
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
