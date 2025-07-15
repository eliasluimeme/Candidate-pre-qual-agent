"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ResetButton() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleReset = async () => {
    try {
      setIsDeleting(true)
      
      // First, let's check how many records we have
      const { count: stepsCount } = await supabase
        .from("application_steps")
        .select("*", { count: "exact", head: true })
      
      const { count: appsCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
      
      console.log(`Found ${stepsCount} application steps and ${appsCount} applications`)
      
      // Method 1: Try different deletion approaches for steps
      let stepsDeleted = false
      
      // Try deleting steps with step_order >= 1
      try {
        const { data: deletedSteps1, error: stepsError1 } = await supabase
          .from("application_steps")
          .delete()
          .gte("step_order", 1)
        
        if (!stepsError1) {
          console.log("Steps deleted with step_order >= 1:", deletedSteps1)
          stepsDeleted = true
        } else {
          console.log("Failed with step_order >= 1:", stepsError1)
        }
      } catch (e) {
        console.log("Exception with step_order:", e)
      }
      
      // Try deleting steps with created_at filter
      if (!stepsDeleted) {
        try {
          const { data: deletedSteps2, error: stepsError2 } = await supabase
            .from("application_steps")
            .delete()
            .gte("created_at", "2020-01-01")
          
          if (!stepsError2) {
            console.log("Steps deleted with created_at filter:", deletedSteps2)
            stepsDeleted = true
          } else {
            console.log("Failed with created_at filter:", stepsError2)
          }
        } catch (e) {
          console.log("Exception with created_at:", e)
        }
      }
      
      // Try deleting steps with id not null
      if (!stepsDeleted) {
        try {
          const { data: deletedSteps3, error: stepsError3 } = await supabase
            .from("application_steps")
            .delete()
            .not("id", "is", null)
          
          if (!stepsError3) {
            console.log("Steps deleted with id not null:", deletedSteps3)
            stepsDeleted = true
          } else {
            console.log("Failed with id not null:", stepsError3)
          }
        } catch (e) {
          console.log("Exception with id not null:", e)
        }
      }
      
      // Method 2: Try different deletion approaches for applications
      let appsDeleted = false
      
      // Try deleting apps with current_step >= 0
      try {
        const { data: deletedApps1, error: appsError1 } = await supabase
          .from("applications")
          .delete()
          .gte("current_step", 0)
        
        if (!appsError1) {
          console.log("Apps deleted with current_step >= 0:", deletedApps1)
          appsDeleted = true
        } else {
          console.log("Failed with current_step >= 0:", appsError1)
        }
      } catch (e) {
        console.log("Exception with current_step:", e)
      }
      
      // Try deleting apps with created_at filter
      if (!appsDeleted) {
        try {
          const { data: deletedApps2, error: appsError2 } = await supabase
            .from("applications")
            .delete()
            .gte("applied_at", "2020-01-01")
          
          if (!appsError2) {
            console.log("Apps deleted with applied_at filter:", deletedApps2)
            appsDeleted = true
          } else {
            console.log("Failed with applied_at filter:", appsError2)
          }
        } catch (e) {
          console.log("Exception with applied_at:", e)
        }
      }
      
      // Try deleting apps with id not null
      if (!appsDeleted) {
        try {
          const { data: deletedApps3, error: appsError3 } = await supabase
            .from("applications")
            .delete()
            .not("id", "is", null)
          
          if (!appsError3) {
            console.log("Apps deleted with id not null:", deletedApps3)
            appsDeleted = true
          } else {
            console.log("Failed with id not null:", appsError3)
          }
        } catch (e) {
          console.log("Exception with id not null:", e)
        }
      }
      
      // Method 3: Individual record deletion as last resort
      if (!stepsDeleted || !appsDeleted) {
        console.log("Trying individual record deletion...")
        
        // Get all records and delete them one by one
        const { data: allSteps } = await supabase
          .from("application_steps")
          .select("id")
        
        if (allSteps && allSteps.length > 0) {
          for (const step of allSteps) {
            const { error } = await supabase
              .from("application_steps")
              .delete()
              .eq("id", step.id)
            
            if (error) {
              console.log(`Failed to delete step ${step.id}:`, error)
            }
          }
        }
        
        const { data: allApps } = await supabase
          .from("applications")
          .select("id")
        
        if (allApps && allApps.length > 0) {
          for (const app of allApps) {
            const { error } = await supabase
              .from("applications")
              .delete()
              .eq("id", app.id)
            
            if (error) {
              console.log(`Failed to delete app ${app.id}:`, error)
            }
          }
        }
      }
      
      // Verify deletion
      const { count: remainingSteps } = await supabase
        .from("application_steps")
        .select("*", { count: "exact", head: true })
      
      const { count: remainingApps } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
      
      console.log(`After deletion: ${remainingSteps} steps and ${remainingApps} applications remaining`)
      
      if (remainingSteps === 0 && remainingApps === 0) {
        console.log("All applications deleted successfully")
        // Refresh the page to show the empty state
        window.location.reload()
      } else {
        console.log("Some records may still remain")
      }
      
      setIsOpen(false)
    } catch (error) {
      console.error("Error during reset:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Reset All
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete All Applications</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all applications and their associated steps from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 