"use client"

import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ApplicationsGrid } from "@/components/applications-grid"
import { DashboardStats } from "@/components/dashboard-stats"
import { ApplicationsGridSkeleton } from "@/components/applications-grid-skeleton"
import { ResetButton } from "@/components/reset-button"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Job Applications Dashboard</h1>
          <ResetButton />
        </div>

        <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
          <DashboardStats />
        </Suspense>

        <Suspense fallback={<ApplicationsGridSkeleton />}>
          <ApplicationsGrid />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
