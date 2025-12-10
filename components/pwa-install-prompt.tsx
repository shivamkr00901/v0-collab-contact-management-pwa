"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const checkInstalled = () => {
      return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
    }

    const checkIsIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches
    }

    const checkDismissedRecently = () => {
      const dismissedTime = localStorage.getItem("pwa_prompt_dismissed_at")
      if (!dismissedTime) return false
      const timeSinceDissmissal = Date.now() - Number.parseInt(dismissedTime, 10)
      return timeSinceDissmissal < 2 * 60 * 60 * 1000 // 2 hours
    }

    if (checkInstalled()) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      const promptEvent = event as BeforeInstallPromptEvent

      if (!checkDismissedRecently()) {
        setDeferredPrompt(promptEvent)
        setShowPrompt(true)
        console.log("[v0] Install prompt available")
      }
    }

    const handleAppInstalled = () => {
      console.log("[v0] App installed successfully")
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.removeItem("pwa_prompt_dismissed_at")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    setIsIOS(checkIsIOS())
    if (checkIsIOS() && !checkDismissedRecently()) {
      setShowPrompt(true)
      console.log("[v0] iOS detected - showing install instructions")
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      console.log("[v0] Install prompt triggered")
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        console.log("[v0] User accepted installation")
        setShowPrompt(false)
      } else {
        localStorage.setItem("pwa_prompt_dismissed_at", Date.now().toString())
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    localStorage.setItem("pwa_prompt_dismissed_at", Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) {
    return null
  }

  if (isIOS) {
    return (
      <div className="fixed bottom-4 right-4 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-4">
        <Card className="p-4 border-primary/50 bg-gradient-to-r from-primary to-secondary shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4" />
                Install Collab on iOS
              </h3>
              <ol className="text-white/90 text-sm space-y-1 list-decimal list-inside">
                <li>Tap the Share button</li>
                <li>Select "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:bg-white/20 p-2 rounded-lg flex-shrink-0 transition-colors"
              aria-label="Close install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full mt-4 border-white/30 text-white hover:bg-white/10 bg-transparent"
          >
            Got It
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm animate-in fade-in slide-in-from-bottom-4">
      <Card className="p-4 border-primary/50 bg-gradient-to-r from-primary to-secondary shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4" />
              Install Collab
            </h3>
            <p className="text-white/90 text-sm">Install as a native app for quick access anytime</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:bg-white/20 p-2 rounded-lg flex-shrink-0 transition-colors"
            aria-label="Close install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleInstall} className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold">
            Install
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
          >
            Later
          </Button>
        </div>
      </Card>
    </div>
  )
}
