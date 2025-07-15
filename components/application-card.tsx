"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, CheckCircle, Loader2 } from "lucide-react"
import type { Application } from "./applications-grid"

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const completedSteps = application.steps.filter((step) => step.status === "completed").length
  const progressPercentage = (completedSteps / application.steps.length) * 100

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "in-progress":
        return <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
    }
  }

  const getStepTextColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-700 dark:text-green-400"
      case "in-progress":
        return "text-blue-700 dark:text-blue-400"
      default:
        return "text-gray-500 dark:text-gray-400"
    }
  }

  return (
    <Card className="hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200 border-border/50 dark:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20">
                {application.candidateName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{application.candidateName}</CardTitle>
              <p className="text-sm text-muted-foreground">{application.candidateEmail}</p>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {application.position}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedSteps}/{application.steps.length} steps
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          {application.steps.map((step, index) => (
            <div key={step.id} className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                {getStatusIcon(step.status)}
                <span className={`text-sm ${getStepTextColor(step.status)}`}>{step.name}</span>
              </div>

              <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                {step.status === "in-progress" ? "In Progress" : step.status === "completed" ? "Done" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Applied {new Date(application.appliedAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
