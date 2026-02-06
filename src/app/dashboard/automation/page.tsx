'use client'

import { useState, useEffect } from 'react'
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Save,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

interface AutomationRule {
  _id: string
  name: string
  description: string
  trigger: {
    type: string
    conditions: Record<string, any>
  }
  actions: Array<{
    type: string
    params: Record<string, any>
  }>
  isActive: boolean
  executionCount: number
  lastExecuted?: string
  createdAt: string
}

const TRIGGER_TYPES = [
  { value: 'deadline_approaching', label: 'Deadline Approaching', description: 'X days before deadline' },
  { value: 'task_overdue', label: 'Task Overdue', description: 'When task passes deadline' },
  { value: 'no_response', label: 'No Response', description: 'X days after last reminder' },
  { value: 'status_changed', label: 'Status Changed', description: 'When task status changes' },
  { value: 'reminder_count', label: 'Reminder Count', description: 'After X reminders sent' },
]

const ACTION_TYPES = [
  { value: 'send_reminder', label: 'Send Reminder' },
  { value: 'escalate', label: 'Escalate Priority' },
  { value: 'notify_slack', label: 'Notify Slack' },
  { value: 'update_status', label: 'Update Status' },
]

export default function AutomationPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)
  const [saving, setSaving] = useState(false)
  const [runningAutomation, setRunningAutomation] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    triggerType: 'deadline_approaching',
    daysThreshold: 3,
    action: 'send_reminder',
    useAI: true,
    isActive: true,
  })

  const fetchRules = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/rules')
      const data = await response.json()

      if (response.ok) {
        setRules(data.rules || [])
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch automation rules',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch automation rules',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [])

  const handleRunAutomation = async () => {
    setRunningAutomation(true)
    try {
      // First check overdue tasks
      const overdueRes = await fetch('/api/cron/check-overdue', { method: 'POST' })
      const overdueData = await overdueRes.json()
      
      // Then run automation rules
      const automationRes = await fetch('/api/cron/run-automation', { method: 'POST' })
      const automationData = await automationRes.json()

      if (overdueRes.ok && automationRes.ok) {
        toast({
          title: '✅ Automation Executed!',
          description: `Overdue: ${overdueData.results?.updated || 0} tasks updated, ${overdueData.results?.emailsSent || 0} emails. Rules: ${automationData.results?.remindersSent || 0} reminders sent.`,
        })
        fetchRules() // Refresh to show updated execution counts
      } else {
        toast({
          title: 'Partial Success',
          description: 'Some automation tasks may have failed. Check console.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to run automation',
        variant: 'destructive',
      })
    } finally {
      setRunningAutomation(false)
    }
  }

  const handleOpenDialog = (rule?: AutomationRule) => {
    if (rule) {
      setEditingRule(rule)
      setFormData({
        name: rule.name,
        description: rule.description || '',
        triggerType: rule.trigger.type,
        daysThreshold: rule.trigger.conditions.days || 3,
        action: rule.actions[0]?.type || 'send_reminder',
        useAI: rule.actions[0]?.params.useAI ?? true,
        isActive: rule.isActive,
      })
    } else {
      setEditingRule(null)
      setFormData({
        name: '',
        description: '',
        triggerType: 'deadline_approaching',
        daysThreshold: 3,
        action: 'send_reminder',
        useAI: true,
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveRule = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Rule name is required',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        trigger: {
          type: formData.triggerType,
          conditions: {
            days: formData.daysThreshold,
          },
        },
        actions: [
          {
            type: formData.action,
            params: {
              useAI: formData.useAI,
            },
          },
        ],
        isActive: formData.isActive,
      }

      const url = editingRule ? `/api/rules?id=${editingRule._id}` : '/api/rules'
      const method = editingRule ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: editingRule ? 'Rule updated' : 'Rule created',
          description: `Automation rule "${formData.name}" has been ${editingRule ? 'updated' : 'created'}.`,
        })
        setIsDialogOpen(false)
        fetchRules()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save rule',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save rule',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/rules?id=${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setRules(rules.map(r => 
          r._id === ruleId ? { ...r, isActive } : r
        ))
        toast({
          title: isActive ? 'Rule activated' : 'Rule paused',
          description: `Automation rule has been ${isActive ? 'activated' : 'paused'}.`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update rule',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return

    try {
      const response = await fetch(`/api/rules?id=${ruleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setRules(rules.filter(r => r._id !== ruleId))
        toast({
          title: 'Rule deleted',
          description: 'Automation rule has been removed.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete rule',
        variant: 'destructive',
      })
    }
  }

  const getTriggerLabel = (type: string) => {
    return TRIGGER_TYPES.find(t => t.value === type)?.label || type
  }

  const getActionLabel = (type: string) => {
    return ACTION_TYPES.find(a => a.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Rules</h1>
          <p className="text-gray-500">
            Create rules to automatically send reminders and take actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={handleRunAutomation}
            disabled={runningAutomation}
            className="bg-green-600 hover:bg-green-700"
          >
            {runningAutomation ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Now
          </Button>
          <Button variant="outline" onClick={fetchRules}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
                </DialogTitle>
                <DialogDescription>
                  Set up automatic actions based on task conditions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Deadline Reminder"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Describe what this rule does"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Trigger</Label>
                  <Select
                    value={formData.triggerType}
                    onValueChange={(value) => setFormData({ ...formData, triggerType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPES.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div>
                            <span>{trigger.label}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({trigger.description})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {['deadline_approaching', 'no_response'].includes(formData.triggerType) && (
                  <div className="space-y-2">
                    <Label htmlFor="days">Days Threshold</Label>
                    <Input
                      id="days"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.daysThreshold}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        daysThreshold: parseInt(e.target.value) || 1 
                      })}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.triggerType === 'deadline_approaching'
                        ? 'Trigger when deadline is this many days away'
                        : 'Trigger when no response after this many days'}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select
                    value={formData.action}
                    onValueChange={(value) => setFormData({ ...formData, action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.action === 'send_reminder' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Use AI-Generated Messages</Label>
                      <p className="text-xs text-gray-500">
                        Generate personalized reminder messages using AI
                      </p>
                    </div>
                    <Switch
                      checked={formData.useAI}
                      onCheckedChange={(checked) => setFormData({ ...formData, useAI: checked })}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <Label>Enable Rule</Label>
                    <p className="text-xs text-gray-500">
                      Rule will start executing immediately when enabled
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRule} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Powered by Boltic</h3>
              <p className="text-sm text-gray-600 mt-1">
                Automation rules are executed by Boltic platform through scheduled webhooks.
                When conditions are met, Boltic triggers your configured actions automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-96" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900">No automation rules yet</h3>
              <p className="text-gray-500 mt-1 mb-4">
                Create your first rule to start automating reminders
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule._id} className={!rule.isActive ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    rule.isActive ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Zap className={`h-6 w-6 ${
                      rule.isActive ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                      <Badge variant={rule.isActive ? 'success' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Paused'}
                      </Badge>
                    </div>

                    {rule.description && (
                      <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Trigger:</span>
                        {getTriggerLabel(rule.trigger.type)}
                        {rule.trigger.conditions.days && (
                          <span className="text-gray-400">
                            ({rule.trigger.conditions.days} days)
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Action:</span>
                        {getActionLabel(rule.actions[0]?.type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Executed {rule.executionCount} times</span>
                      {rule.lastExecuted && (
                        <span>
                          Last run: {new Date(rule.lastExecuted).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={(checked) => handleToggleRule(rule._id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(rule)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRule(rule._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
