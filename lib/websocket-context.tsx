"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface WebSocketContextType {
  connected: boolean
  subscribe: (groupId: string, callback: (data: any) => void) => () => void
  broadcast: (groupId: string, event: string, data: any) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [subscriptions, setSubscriptions] = useState<Map<string, Set<Function>>>(new Map())

  useEffect(() => {
    // For demo purposes, using in-memory subscriptions
    // In production, you'd connect to actual WebSocket server
    setConnected(true)
    return () => setConnected(false)
  }, [])

  const subscribe = (groupId: string, callback: Function) => {
    setSubscriptions((prev) => {
      const updated = new Map(prev)
      if (!updated.has(groupId)) {
        updated.set(groupId, new Set())
      }
      updated.get(groupId)!.add(callback)
      return updated
    })

    return () => {
      setSubscriptions((prev) => {
        const updated = new Map(prev)
        updated.get(groupId)?.delete(callback)
        return updated
      })
    }
  }

  const broadcast = (groupId: string, event: string, data: any) => {
    const callbacks = subscriptions.get(groupId)
    if (callbacks) {
      callbacks.forEach((cb) => cb({ event, data }))
    }
  }

  return <WebSocketContext.Provider value={{ connected, subscribe, broadcast }}>{children}</WebSocketContext.Provider>
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider")
  }
  return context
}
