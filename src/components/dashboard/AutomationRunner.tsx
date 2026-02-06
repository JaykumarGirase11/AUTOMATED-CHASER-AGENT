'use client'

import { useEffect, useRef } from 'react'

// This component runs automation checks in the background
// Checks every 5 minutes while the app is open

export default function AutomationRunner() {
  const hasRun = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const runAutomation = async () => {
    try {
      console.log('🤖 Running automatic checks...')
      
      // Check for overdue tasks and update status + send emails
      const overdueRes = await fetch('/api/cron/check-overdue', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const overdueData = await overdueRes.json()
      
      if (overdueData.results?.updated > 0) {
        console.log(`✅ Marked ${overdueData.results.updated} tasks as overdue`)
      }
      if (overdueData.results?.emailsSent > 0) {
        console.log(`📧 Sent ${overdueData.results.emailsSent} overdue notification emails`)
      }

      // Run automation rules
      const automationRes = await fetch('/api/cron/run-automation', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const automationData = await automationRes.json()
      
      if (automationData.results?.remindersSent > 0) {
        console.log(`📧 Sent ${automationData.results.remindersSent} automated reminders`)
      }

      console.log('🤖 Automatic checks completed')
    } catch (error) {
      console.error('Automation check failed:', error)
    }
  }

  useEffect(() => {
    // Run once on mount (when user opens dashboard)
    if (!hasRun.current) {
      hasRun.current = true
      // Small delay to let the page load first
      setTimeout(runAutomation, 2000)
    }

    // Then run every 5 minutes
    intervalRef.current = setInterval(runAutomation, 5 * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
