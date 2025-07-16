"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { ApplicationCard } from "./application-card"
import { supabase } from "@/lib/supabase"
import { useRealtime } from "@/hooks/use-realtime"

export interface ApplicationStep {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed"
  completedAt?: string
}

export interface Application {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  appliedAt: string
  currentStep: number
  steps: ApplicationStep[]
}

const STEPS = [
  { id: "email-received", name: "Email Received" },
  { id: "attachment-downloaded", name: "Attachment Downloaded" },
  { id: "resume-parsing", name: "Resume Parsing" },
  { id: "resume-scoring", name: "Resume Scoring" },
  { id: "crm-update", name: "CRM Update" },
  { id: "candidate-contacted", name: "Candidate Contacted" },
  { id: "candidate-pre-qualified", name: "Candidate Pre-Qualified" },
  { id: "consultant-notified", name: "Consultant Notified" },
]

export function ApplicationsGrid() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const fetchApplications = useCallback(async () => {
    try {
      // Only show loading state on initial load, not on real-time updates
      if (isInitialLoad) {
        setLoading(true)
      }

      // Fetch applications with their steps
      const { data: applicationsData, error: applicationsError } = await supabase
        .from("applications")
        .select(`
          *,
          application_steps (
            id,
            step_name,
            step_order,
            status,
            completed_at
          )
        `)
        .order("applied_at", { ascending: false })

      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError)
        return
      }

      // Transform the data to match our Application interface
      const transformedApplications: Application[] =
        applicationsData?.map((app) => ({
          id: app.id,
          candidateName: app.candidate_name,
          candidateEmail: app.candidate_email,
          position: app.position,
          appliedAt: app.applied_at,
          currentStep: app.current_step,
          steps: app.application_steps
            .sort((a: any, b: any) => a.step_order - b.step_order)
            .map((step: any) => ({
              id: step.id,
              name: step.step_name,
              status: step.status,
              completedAt: step.completed_at,
            })),
        })) || []

      setApplications(transformedApplications)
    } catch (error) {
      console.error("Error:", error)
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
    callback: fetchApplications,
    enabled: true
  })

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  if (loading) {
    return <div>Loading applications...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Applications</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">{applications.length} applications</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-muted-foreground">
              {connectionStatus === 'connected' ? 'Live' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>
    </div>
  )
}
