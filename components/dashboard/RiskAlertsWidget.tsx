'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface RiskAlert {
  id: string
  alert_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string | null
  entity_type: string | null
  action_url: string | null
  created_at: string
}

const severityColors: Record<string, string> = {
  low: 'text-blue-700 bg-blue-50 border-blue-200',
  medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  high: 'text-orange-700 bg-orange-50 border-orange-200',
  critical: 'text-red-700 bg-red-50 border-red-200',
}

const AlertIcon = ({ type, className = "w-5 h-5" }: { type: string; className?: string }) => {
  switch (type) {
    case 'overdue_task':
      return (
        <svg className={`${className} text-yellow-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    case 'missed_deadline':
      return (
        <svg className={`${className} text-red-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'calendar_conflict':
      return (
        <svg className={`${className} text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'habit_break':
      return (
        <svg className={`${className} text-orange-600`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 23c-3.9 0-7-3.1-7-7 0-2.8 1.6-5.2 4-6.3V3c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v6.7c2.4 1.1 4 3.5 4 6.3 0 3.9-3.1 7-7 7zm-2-9.5V4h4v9.5c2 .8 3 2.6 3 4.5 0 2.8-2.2 5-5 5s-5-2.2-5-5c0-1.9 1-3.7 3-4.5z" />
        </svg>
      )
    case 'goal_stall':
      return (
        <svg className={`${className} text-purple-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'budget_exceed':
      return (
        <svg className={`${className} text-green-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    default:
      return (
        <svg className={`${className} text-gray-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
  }
}

export function RiskAlertsWidget() {
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/risk-detection')
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcknowledge = async (alertId: string) => {
    try {
      await fetch('/api/risk-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge', alertId }),
      })
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  const handleAcknowledgeAll = async () => {
    try {
      await fetch('/api/risk-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge_all' }),
      })
      setAlerts([])
    } catch (error) {
      console.error('Failed to acknowledge all alerts:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded-lg"></div>
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">All Clear</h3>
            <p className="text-sm text-gray-600">No risk alerts detected</p>
          </div>
        </div>
      </div>
    )
  }

  const displayedAlerts = isExpanded ? alerts : alerts.slice(0, 3)
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const highCount = alerts.filter(a => a.severity === 'high').length

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Risk Alerts</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={handleAcknowledgeAll}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Dismiss all
          </button>
        )}
      </div>

      {(criticalCount > 0 || highCount > 0) && (
        <div className="flex gap-2 mb-4">
          {criticalCount > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
              {highCount} high
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {displayedAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${severityColors[alert.severity]} transition-all hover:shadow-sm`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertIcon type={alert.alert_type} className="w-6 h-6" />
                <div>
                  <div className="font-medium">{alert.title}</div>
                  {alert.description && (
                    <p className="text-sm opacity-80 mt-0.5">{alert.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleAcknowledge(alert.id)}
                className="shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {alert.action_url && (
              <Link
                href={alert.action_url}
                className="inline-block mt-2 text-xs underline opacity-70 hover:opacity-100"
              >
                View details
              </Link>
            )}
          </div>
        ))}
      </div>

      {alerts.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? 'Show less' : `Show ${alerts.length - 3} more alerts`}
        </button>
      )}
    </div>
  )
}
