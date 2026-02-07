import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'

export const dynamic = 'force-dynamic'
import Task from '@/models/Task'
import ReminderLog from '@/models/ReminderLog'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'all'

    // Calculate date range based on timeframe
    let dateFilter: any = {}
    const now = new Date()
    
    if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { createdAt: { $gte: weekAgo } }
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { createdAt: { $gte: monthAgo } }
    }

    // Get all users
    const users = await User.find({}).lean()

    // Calculate stats for each user
    const userStatsPromises = users.map(async (user) => {
      const userId = user._id.toString()

      // Get tasks stats
      const tasksQuery = { createdBy: userId, ...dateFilter }
      const totalTasks = await Task.countDocuments(tasksQuery)
      const completedTasks = await Task.countDocuments({ ...tasksQuery, status: 'completed' })
      const onTimeTasks = await Task.countDocuments({
        ...tasksQuery,
        status: 'completed',
        $expr: { $lte: ['$completedAt', '$deadline'] }
      })

      // Get reminders sent
      const remindersSent = await ReminderLog.countDocuments({ 
        createdBy: userId,
        status: 'sent',
        ...dateFilter 
      })

      // Get AI generated reminders
      const aiReminders = await ReminderLog.countDocuments({
        createdBy: userId,
        isAIGenerated: true,
        ...dateFilter
      })

      // Calculate on-time rate
      const onTimeRate = completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0

      // Calculate points
      // Points formula: completed tasks * 10 + on-time bonus * 5 + reminders * 2
      const points = (completedTasks * 10) + (onTimeTasks * 5) + (remindersSent * 2)

      // Calculate streak (consecutive days with completed tasks)
      const streak = await calculateStreak(userId)

      // Determine badges
      const badges = determineBadges({
        completedTasks,
        onTimeRate,
        remindersSent,
        aiReminders,
        streak
      })

      return {
        userId,
        name: user.name,
        email: user.email,
        tasksCompleted: completedTasks,
        totalTasks,
        remindersSent,
        onTimeRate,
        streak,
        points,
        badges,
        isCurrentUser: userId === authUser.userId
      }
    })

    const allStats = await Promise.all(userStatsPromises)

    // Sort by points and assign ranks
    allStats.sort((a, b) => b.points - a.points)
    const leaderboard = allStats.map((stats, index) => ({
      ...stats,
      rank: index + 1
    }))

    // Get current user stats
    const currentUserStats = leaderboard.find(u => u.isCurrentUser)

    return NextResponse.json({
      leaderboard,
      userStats: currentUserStats || null
    })

  } catch (error: any) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    )
  }
}

// Calculate consecutive days streak
async function calculateStreak(userId: string): Promise<number> {
  const tasks = await Task.find({
    createdBy: userId,
    status: 'completed',
    completedAt: { $exists: true }
  })
    .sort({ completedAt: -1 })
    .limit(100)
    .lean()

  if (tasks.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Group tasks by date
  const completedDates = new Set(
    tasks.map(t => {
      const date = new Date(t.completedAt!)
      date.setHours(0, 0, 0, 0)
      return date.getTime()
    })
  )

  // Count consecutive days backwards from today
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000)
    if (completedDates.has(checkDate.getTime())) {
      streak++
    } else if (i > 0) {
      // Allow today to not have completions yet
      break
    }
  }

  return streak
}

// Determine which badges a user has earned
function determineBadges(stats: {
  completedTasks: number
  onTimeRate: number
  remindersSent: number
  aiReminders: number
  streak: number
}): string[] {
  const badges: string[] = []

  if (stats.completedTasks >= 1) badges.push('first_task')
  if (stats.completedTasks >= 10) badges.push('task_beginner')
  if (stats.completedTasks >= 50) badges.push('task_pro')
  if (stats.completedTasks >= 100) badges.push('task_master')
  
  if (stats.streak >= 7) badges.push('streak_7')
  if (stats.streak >= 30) badges.push('streak_30')
  
  if (stats.onTimeRate >= 90) badges.push('on_time_pro')
  
  if (stats.remindersSent >= 50) badges.push('reminder_pro')
  if (stats.remindersSent >= 100) badges.push('reminder_guru')
  
  if (stats.aiReminders >= 50) badges.push('ai_adopter')

  return badges
}
