'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, 
  Medal, 
  Star, 
  Crown, 
  Flame,
  TrendingUp,
  Target,
  Award,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'

interface UserStats {
  userId: string
  name: string
  tasksCompleted: number
  remindersSent: number
  onTimeRate: number
  streak: number
  points: number
  rank: number
  badges: string[]
}

interface LeaderboardEntry {
  rank: number
  name: string
  points: number
  tasksCompleted: number
  streak: number
  isCurrentUser: boolean
}

const BADGES = [
  { id: 'first_task', name: 'First Task', icon: Star, description: 'Completed your first task', color: 'text-yellow-500' },
  { id: 'streak_7', name: 'Week Warrior', icon: Flame, description: '7-day completion streak', color: 'text-orange-500' },
  { id: 'streak_30', name: 'Monthly Master', icon: Crown, description: '30-day completion streak', color: 'text-purple-500' },
  { id: 'on_time_pro', name: 'On-Time Pro', icon: Target, description: '90% on-time completion rate', color: 'text-green-500' },
  { id: 'reminder_guru', name: 'Reminder Guru', icon: TrendingUp, description: 'Sent 100+ reminders', color: 'text-blue-500' },
  { id: 'ai_adopter', name: 'AI Adopter', icon: Star, description: 'Used AI for 50+ reminders', color: 'text-pink-500' },
  { id: 'task_master', name: 'Task Master', icon: Trophy, description: 'Completed 100+ tasks', color: 'text-amber-500' },
  { id: 'automation_expert', name: 'Automation Expert', icon: Award, description: 'Created 10+ automation rules', color: 'text-indigo-500' },
]

export default function LeaderboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeframe, setTimeframe] = useState('all')

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`)
      const data = await response.json()

      if (response.ok) {
        // Set user stats
        if (data.userStats) {
          setUserStats({
            userId: data.userStats.userId,
            name: data.userStats.name,
            tasksCompleted: data.userStats.tasksCompleted,
            remindersSent: data.userStats.remindersSent,
            onTimeRate: data.userStats.onTimeRate,
            streak: data.userStats.streak,
            points: data.userStats.points,
            rank: data.userStats.rank,
            badges: data.userStats.badges || [],
          })
        }

        // Set leaderboard
        setLeaderboard(data.leaderboard?.map((entry: any) => ({
          rank: entry.rank,
          name: entry.name,
          points: entry.points,
          tasksCompleted: entry.tasksCompleted,
          streak: entry.streak,
          isCurrentUser: entry.isCurrentUser,
        })) || [])
      } else {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [timeframe])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-500">{rank}</span>
    }
  }

  const getNextLevelProgress = () => {
    if (!userStats) return 0
    const nextLevelPoints = Math.ceil(userStats.points / 1000) * 1000
    const currentLevelPoints = Math.floor(userStats.points / 1000) * 1000
    return ((userStats.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500">Compete with others and earn badges</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* User Stats & Badges */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Your Stats */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {userStats && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {userStats.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{userStats.name}</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-500">Rank #{userStats.rank}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{userStats.points}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{userStats.streak}</p>
                    <p className="text-xs text-gray-500">Day Streak</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{userStats.tasksCompleted}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{userStats.onTimeRate}%</p>
                    <p className="text-xs text-gray-500">On-Time</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level Progress</span>
                    <span className="text-gray-500">
                      {userStats.points} / {Math.ceil(userStats.points / 1000) * 1000}
                    </span>
                  </div>
                  <Progress value={getNextLevelProgress()} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Badges
            </CardTitle>
            <CardDescription>
              Earn badges by completing tasks and maintaining streaks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BADGES.map((badge) => {
                const earned = userStats?.badges.includes(badge.id)
                const IconComponent = badge.icon
                
                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      earned
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <IconComponent className={`h-8 w-8 mx-auto mb-2 ${
                      earned ? badge.color : 'text-gray-300'
                    }`} />
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                    {earned && (
                      <Badge className="mt-2 text-xs" variant="success">Earned</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>
                Rankings based on points earned
              </CardDescription>
            </div>
            <Tabs value={timeframe} onValueChange={setTimeframe}>
              <TabsList>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {entry.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="text-blue-600 text-sm ml-2">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.tasksCompleted} tasks completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  {entry.streak > 0 && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Flame className="h-4 w-4" />
                      <span>{entry.streak} days</span>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How Points Work */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-base">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-green-100 rounded">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Complete Task</p>
                <p className="text-gray-500">+50 points</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-blue-100 rounded">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">On-Time Completion</p>
                <p className="text-gray-500">+25 bonus</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-orange-100 rounded">
                <Flame className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Daily Streak</p>
                <p className="text-gray-500">+10 per day</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-purple-100 rounded">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Use AI Reminder</p>
                <p className="text-gray-500">+5 points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
