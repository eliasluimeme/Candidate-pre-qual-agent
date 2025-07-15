"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, AlertCircle, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRealtime } from "@/hooks/use-realtime"

interface Stats {
  total: number
  completed: number
  inProgress: number
  pending: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      // Only show loading state on initial load, not on real-time updates
      if (isInitialLoad) {
        setLoading(true)
      }
      
      // Get total applications count
      const { count: totalCount } = await supabase.from("applications").select("*", { count: "exact", head: true })

      // Get completed applications (where current_step = 6)
      const { count: completedCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("current_step", 6)

      // Get in-progress applications (where current_step > 0 and < 6)
      const { count: inProgressCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .gt("current_step", 0)
        .lt("current_step", 6)

      // Get pending applications (where current_step = 0)
      const { count: pendingCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("current_step", 0)

      setStats({
        total: totalCount || 0,
        completed: completedCount || 0,
        inProgress: inProgressCount || 0,
        pending: pendingCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      if (isInitialLoad) {
        setLoading(false)
        setIsInitialLoad(false)
      }
    }
  }, [isInitialLoad])

  // Memoize the tables array to prevent recreation
  const realtimeTables = useMemo(() => ['applications', 'application_steps'], [])

  // Set up real-time subscription
  const { connectionStatus } = useRealtime({
    table: realtimeTables,
    callback: fetchStats,
    enabled: true
  })

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading) {
    return <div className="h-32 bg-muted animate-pulse rounded-lg" />
  }

  const statCards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: AlertCircle,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-800/50",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
