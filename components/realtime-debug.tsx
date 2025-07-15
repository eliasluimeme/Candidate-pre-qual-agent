"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealtime } from "@/hooks/use-realtime"

export function RealtimeDebug() {
  const [logs, setLogs] = useState<string[]>([])
  const [subscriptionCount, setSubscriptionCount] = useState(0)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]) // Keep last 10 logs
  }

  const { connectionStatus } = useRealtime({
    table: ['applications', 'application_steps'],
    callback: () => {
      addLog("Real-time callback triggered")
      setSubscriptionCount(prev => prev + 1)
    },
    enabled: true
  })

  useEffect(() => {
    addLog(`Connection status changed to: ${connectionStatus}`)
  }, [connectionStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      case 'disconnected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Real-time Debug
          <Badge variant="outline" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(connectionStatus)}`} />
            {connectionStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <strong>Callback Count:</strong> {subscriptionCount}
        </div>
        
        <div className="space-y-2">
          <strong className="text-sm">Recent Logs:</strong>
          <div className="bg-muted p-2 rounded text-xs font-mono max-h-40 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-border/50 last:border-0">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 