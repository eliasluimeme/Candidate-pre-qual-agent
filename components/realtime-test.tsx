"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export function RealtimeTest() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null)

  const createTestApplication = async () => {
    setIsCreating(true)
    try {
      const { data, error } = await supabase
        .from("applications")
        .insert({
          candidate_name: `Test User ${Date.now()}`,
          candidate_email: `test${Date.now()}@example.com`,
          position: "Test Position",
          current_step: 0
        })
        .select()
        .single()

      if (error) throw error

      setLastCreatedId(data.id)
      
      // Create application steps
      const stepNames = ['Email Received', 'Attachment Downloaded', 'Resume Parsing', 'Resume Scoring', 'CRM Update', 'Candidate Contacted', 'Candidate Pre-Qualified', 'Consultant Notified', 'Consultant Replied', 'Meeting Scheduled', 'Meeting Transcribed', 'GTM Sent']
      const steps = stepNames.map((name, index) => ({
        application_id: data.id,
        step_name: name,
        step_order: index + 1,
        status: 'pending' as const
      }))

      await supabase.from("application_steps").insert(steps)
      
      console.log("Test application created:", data.id)
    } catch (error) {
      console.error("Error creating test application:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const updateTestApplication = async () => {
    if (!lastCreatedId) return
    
    setIsUpdating(true)
    try {
      // Update application to step 2
      await supabase
        .from("applications")
        .update({ current_step: 2 })
        .eq("id", lastCreatedId)

      // Update step 1 to completed
      await supabase
        .from("application_steps")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("application_id", lastCreatedId)
        .eq("step_order", 1)

      // Update step 2 to in-progress
      await supabase
        .from("application_steps")
        .update({ status: "in-progress" })
        .eq("application_id", lastCreatedId)
        .eq("step_order", 2)

      console.log("Test application updated:", lastCreatedId)
    } catch (error) {
      console.error("Error updating test application:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const advanceTestApplication = async () => {
    if (!lastCreatedId) return
    
    setIsAdvancing(true)
    try {
      // Get current application state
      const { data: app } = await supabase
        .from("applications")
        .select("current_step, id")
        .eq("id", lastCreatedId)
        .single()

      if (!app || app.current_step >= 12) {
        console.log("No application to advance or already at final step")
        return
      }

      const nextStep = app.current_step + 1
      console.log(`Advancing application ${app.id} to step ${nextStep}`)

      // Update the application's current step
      await supabase
        .from("applications")
        .update({ current_step: nextStep })
        .eq("id", app.id)

      // Update the step status
      if (nextStep <= 12) {
        await supabase
          .from("application_steps")
          .update({ status: nextStep === 12 ? "completed" : "in-progress" })
          .eq("application_id", app.id)
          .eq("step_order", nextStep)

        if (nextStep === 12) {
          await supabase
            .from("application_steps")
            .update({ completed_at: new Date().toISOString() })
            .eq("application_id", app.id)
            .eq("step_order", nextStep)
        }
      }
    } catch (error) {
      console.error("Error advancing application:", error)
    } finally {
      setIsAdvancing(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Real-time Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={createTestApplication} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Test Application"}
        </Button>
        
        <Button 
          onClick={updateTestApplication} 
          disabled={isUpdating || !lastCreatedId}
          variant="outline"
          className="w-full"
        >
          {isUpdating ? "Updating..." : "Update Test Application"}
        </Button>

        <Button 
          onClick={advanceTestApplication} 
          disabled={isAdvancing || !lastCreatedId}
          variant="secondary"
          className="w-full"
        >
          {isAdvancing ? "Advancing..." : "Advance Next Step"}
        </Button>
        
        {lastCreatedId && (
          <p className="text-sm text-muted-foreground">
            Last created: {lastCreatedId}
          </p>
        )}
      </CardContent>
    </Card>
  )
} 