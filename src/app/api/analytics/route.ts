import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Task from '@/models/Task'

export const dynamic = 'force-dynamic'
import ReminderLog from '@/models/ReminderLog'
import { getAuthUser } from '@/lib/auth'
import mongoose from 'mongoose'

// GET - Fetch analytics data
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Convert userId string to ObjectId
    const userId = new mongoose.Types.ObjectId(authUser.userId)

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7days':
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Task statistics
    const totalTasks = await Task.countDocuments({ createdBy: userId })
    
    const tasksByStatus = await Task.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const tasksByPriority = await Task.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ])

    const overdueTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'overdue',
    })

    // Reminder statistics
    const totalReminders = await ReminderLog.countDocuments({
      createdBy: userId,
    })

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const remindersToday = await ReminderLog.countDocuments({
      createdBy: userId,
      createdAt: { $gte: todayStart },
    })

    const remindersThisWeek = await ReminderLog.countDocuments({
      createdBy: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })

    const remindersByStatus = await ReminderLog.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    // Most reminded tasks
    const mostRemindedTasks = await Task.find({ createdBy: userId })
      .sort({ reminderCount: -1 })
      .limit(5)
      .select('title reminderCount assigneeName status priority')
      .lean()

    // Completion rate over time
    const completionTrend = await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          completedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Tasks created over time
    const taskCreationTrend = await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Reminders sent over time
    const reminderTrend = await ReminderLog.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Completion rate
    const completedTasks = await Task.countDocuments({
      createdBy: userId,
      status: 'completed',
    })
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // On-time completion rate
    const onTimeCompleted = await Task.countDocuments({
      createdBy: userId,
      status: 'completed',
      $expr: { $lte: ['$completedAt', '$deadline'] },
    })
    const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompleted / completedTasks) * 100) : 0

    // AI generated percentage
    const aiGeneratedReminders = await ReminderLog.countDocuments({
      createdBy: userId,
      isAIGenerated: true,
    })
    const aiPercentage = totalReminders > 0 ? Math.round((aiGeneratedReminders / totalReminders) * 100) : 0

    return NextResponse.json({
      overview: {
        totalTasks,
        overdueTasks,
        completedTasks,
        completionRate,
        onTimeRate,
        totalReminders,
        remindersToday,
        remindersThisWeek,
        aiPercentage,
      },
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<string, number>),
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<string, number>),
      remindersByStatus: remindersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<string, number>),
      mostRemindedTasks,
      trends: {
        completion: completionTrend,
        taskCreation: taskCreationTrend,
        reminders: reminderTrend,
      },
    })
  } catch (error: any) {
    console.error('Get analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
