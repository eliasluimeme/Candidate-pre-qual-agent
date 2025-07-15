import { useEffect, useRef, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  table: string | string[]
  callback: () => void
  enabled?: boolean
}

export function useRealtime({ table, callback, enabled = true }: UseRealtimeOptions) {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const subscriptionRef = useRef<RealtimeChannel | null>(null)
  const callbackRef = useRef(callback)

  // Keep callback reference up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Memoize the tables array to prevent unnecessary re-renders
  const tables = useMemo(() => {
    return Array.isArray(table) ? table : [table]
  }, [table])

  // Memoize the table key to prevent recreation when array contents are the same
  const tableKey = useMemo(() => {
    return tables.join('_')
  }, [tables])

  useEffect(() => {
    if (!enabled) {
      if (subscriptionRef.current) {
        console.log('Disabling subscription')
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
      setConnectionStatus('disconnected')
      return
    }

    // Only create subscription if we don't already have one
    if (subscriptionRef.current) {
      console.log('Subscription already exists, skipping creation')
      return
    }

    const channelName = `realtime_${tableKey}_${Date.now()}`
    console.log(`Creating subscription: ${channelName}`)

    // Create subscription
    let subscription = supabase.channel(channelName)

    // Add listeners for each table
    tables.forEach(tableName => {
      subscription = subscription.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          console.log(`Real-time change in ${tableName}:`, payload)
          callbackRef.current()
        }
      )
    })

    // Subscribe with status callback
    subscription.subscribe((status) => {
      console.log(`Subscription status for ${channelName}:`, status)
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected')
      } else if (status === 'CLOSED') {
        setConnectionStatus('disconnected')
      } else {
        setConnectionStatus('connecting')
      }
    })

    subscriptionRef.current = subscription

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        console.log(`Cleaning up subscription: ${channelName}`)
        supabase.removeChannel(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [tableKey, enabled]) // Only depend on tableKey and enabled

  return { connectionStatus }
} 