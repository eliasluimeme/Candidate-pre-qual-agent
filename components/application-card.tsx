"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, CheckCircle, Loader2, FileText, MessageCircle } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from "@/lib/supabase"
import type { Application } from "./applications-grid"

interface ConversationMessage {
  id: string
  session_id: string
  message: string
}

interface ApplicationCardProps {
  application: Application
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false)
  const [conversations, setConversations] = useState<ConversationMessage[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  const conversationScrollRef = useRef<HTMLDivElement>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const completedSteps = application.steps.filter((step) => step.status === "completed").length
  const progressPercentage = (completedSteps / application.steps.length) * 100

  const sessionId = application.candidatePhone ? `recruitment-aspire-${application.candidatePhone}` : null

  // Auto-scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (conversationScrollRef.current) {
      const scrollContainer = conversationScrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  const fetchConversations = useCallback(async (isRealTimeUpdate = false) => {
    if (!sessionId) return
    
    // Only show loading on initial fetch, not on real-time updates
    if (!isRealTimeUpdate && isInitialLoad) {
      setLoadingConversations(true)
    }
    
    try {
      const { data, error } = await supabase
        .from('chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('session_id', { ascending: true })

      if (error) {
        console.error('Error fetching conversations:', error)
        return
      }

      setConversations(data || [])
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100)
      
    } catch (error) {
      console.error('Error:', error)
    } finally {
      if (!isRealTimeUpdate && isInitialLoad) {
        setLoadingConversations(false)
        setIsInitialLoad(false)
      }
    }
  }, [sessionId, isInitialLoad, scrollToBottom])

  useEffect(() => {
    if (isConversationModalOpen && sessionId && conversations.length === 0) {
      fetchConversations()
    }
  }, [isConversationModalOpen, sessionId, conversations.length, fetchConversations])

  // Set up real-time subscription for conversations
  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`conversation-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_histories',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Only fetch if we have an active conversation modal or existing conversations
          if (isConversationModalOpen || conversations.length > 0) {
            fetchConversations(true) // Pass true for real-time update
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, isConversationModalOpen, conversations.length, fetchConversations])

  // Auto-scroll on conversations change
  useEffect(() => {
    // Auto-scroll to bottom when conversations change (new messages)
    if (conversations.length > 0 && isConversationModalOpen) {
      setTimeout(scrollToBottom, 100)
    }
  }, [conversations, isConversationModalOpen, scrollToBottom])

  // Reset initial load state when modal opens
  useEffect(() => {
    if (isConversationModalOpen) {
      setIsInitialLoad(true)
    }
  }, [isConversationModalOpen])

  const parseMessage = (messageString: string | object) => {
    try {
      let parsed
      
      // If messageString is already an object, use it directly
      if (typeof messageString === 'object' && messageString !== null) {
        parsed = messageString
      } else {
        // If it's a string, try to parse it as JSON
        parsed = JSON.parse(messageString)
      }
      
      let content = parsed.content
      
      // If content is an object, extract the meaningful text
      if (typeof content === 'object' && content !== null) {
        // Try common text properties first
        if (content.text) {
          content = content.text
        } else if (content.message) {
          content = content.message
        } else if (content.value) {
          content = content.value
        } else {
          // If no standard text property, stringify it nicely
          content = JSON.stringify(content, null, 2)
        }
      }
      
      return {
        type: parsed.type || 'unknown',
        content: String(content || messageString)
      }
    } catch (error) {
      return {
        type: 'unknown',
        content: String(messageString)
      }
    }
  }

  const formatTime = (id: string | number) => {
    // Since we don't have timestamp, we'll show the message ID or a simple counter
    // You could also generate a timestamp based on when the component loads
    const idStr = String(id)
    return `#${idStr.slice(-4)}` // Show last 4 characters of ID
  }

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

        <div className="mt-2 flex gap-2">
          <Dialog open={isResumeModalOpen} onOpenChange={setIsResumeModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-6 px-2">
                <FileText className="h-3 w-3 mr-1" />
                CV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Resume - {application.candidateName}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[60vh] w-full pr-4">
                {application.resume ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{application.resume}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-center">
                    <div className="text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No resume available yet</p>
                      <p className="text-sm">Resume will appear here once parsed</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog open={isConversationModalOpen} onOpenChange={setIsConversationModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-6 px-2"
                disabled={!application.candidatePhone}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Conversation - {application.candidateName}</DialogTitle>
                {application.candidatePhone && (
                  <p className="text-sm text-muted-foreground">{application.candidatePhone}</p>
                )}
              </DialogHeader>
              <ScrollArea className="h-[60vh] w-full" ref={conversationScrollRef}>
                {application.candidatePhone ? (
                  <div className="space-y-3 p-4">
                    {loadingConversations ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : conversations.length > 0 ? (
                      conversations.map((conversation) => {
                        const message = parseMessage(conversation.message)
                        const isAI = message.type === 'ai'
                        const isHuman = message.type === 'human'
                        
                        // Split the message content into separate paragraphs
                        const paragraphs = message.content.split(/\n\n+/).filter(p => p.trim())
                        
                        // If message has multiple paragraphs, render each as a separate bubble
                        if (paragraphs.length > 1) {
                          return paragraphs.map((paragraph, paragraphIndex) => (
                            <div
                              key={`${conversation.id}-${paragraphIndex}`}
                              className={`flex ${isAI ? 'justify-end' : 'justify-start'} ${paragraphIndex > 0 ? 'mt-2' : ''}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                  isAI
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                                }`}
                              >
                                <div className="text-sm whitespace-pre-wrap break-words">
                                  <p>{paragraph.trim()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        }
                        
                        // Single paragraph or no splitting needed
                        return (
                          <div
                            key={conversation.id}
                            className={`flex ${isAI ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                                isAI
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                              }`}
                            >
                              <div className="text-sm whitespace-pre-wrap break-words">
                                <p>{message.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      }).flat()
                    ) : (
                      <div className="flex items-center justify-center h-32 text-center">
                        <div className="text-muted-foreground">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No conversation yet</p>
                          <p className="text-sm">Messages will appear here once the conversation starts</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-center">
                    <div className="text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No phone number available</p>
                      <p className="text-sm">Phone number needed to view conversations</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
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
