'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Bell, 
  Mail, 
  Shield, 
  Sparkles, 
  Save, 
  Loader2,
  Eye,
  EyeOff,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'

interface UserSettings {
  name: string
  email: string
  settings: {
    emailNotifications: boolean
    reminderFrequency: string
    aiTone: string
    defaultReminderChannel: string
    timezone: string
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userData, setUserData] = useState<UserSettings | null>(null)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [settings, setSettings] = useState({
    name: '',
    email: '',
    emailNotifications: true,
    reminderFrequency: 'daily',
    aiTone: 'professional',
    defaultReminderChannel: 'email',
    timezone: 'Asia/Kolkata',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()

        if (response.ok) {
          setUserData(data.user)
          setSettings({
            name: data.user.name || '',
            email: data.user.email || '',
            emailNotifications: data.user.settings?.emailNotifications ?? true,
            reminderFrequency: data.user.settings?.reminderFrequency || 'daily',
            aiTone: data.user.settings?.aiTone || 'professional',
            defaultReminderChannel: data.user.settings?.defaultReminderChannel || 'email',
            timezone: data.user.settings?.timezone || 'Asia/Kolkata',
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load user settings',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // This would be an API call to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: 'Settings saved',
        description: 'Your profile settings have been updated.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      // This would be an API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast({
        title: 'Password changed',
        description: 'Your password has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Settings</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {settings.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-lg">{settings.name}</p>
                  <p className="text-gray-500">{settings.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications for task updates
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Reminder Frequency</Label>
                <Select
                  value={settings.reminderFrequency}
                  onValueChange={(value) => 
                    setSettings({ ...settings, reminderFrequency: value })
                  }
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom Schedule</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  How often the system checks for tasks that need reminders
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Default Reminder Channel</Label>
                <Select
                  value={settings.defaultReminderChannel}
                  onValueChange={(value) => 
                    setSettings({ ...settings, defaultReminderChannel: value })
                  }
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                    <SelectItem value="both">Email + Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Customize AI-generated reminder messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>AI Message Tone</Label>
                <Select
                  value={settings.aiTone}
                  onValueChange={(value) => setSettings({ ...settings, aiTone: value })}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  The tone used when generating AI-powered reminder messages
                </p>
              </div>

              <Separator />

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">AI Model Information</h4>
                <p className="text-sm text-purple-700">
                  This application uses <strong>LLaMA 3.1 70B</strong> via Groq for generating 
                  intelligent, context-aware reminder messages. The model analyzes task details, 
                  deadline proximity, and reminder history to create personalized messages.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">AI Features</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Personalized message generation', enabled: true },
                    { label: 'Delay risk analysis', enabled: true },
                    { label: 'Escalation recommendations', enabled: true },
                    { label: 'Smart scheduling suggestions', enabled: true },
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Change Password</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => 
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => 
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => 
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleChangePassword} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-700 mb-4">
                  Deleting your account will permanently remove all your data including 
                  tasks, reminders, and automation rules. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
