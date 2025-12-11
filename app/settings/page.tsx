"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { ArrowLeft, LogOut, Moon, Sun } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-xl">Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Account Section */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-6">Account</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-6">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <label className="font-medium">Theme</label>
              {mounted && (
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className="gap-2"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className="gap-2"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <h2 className="font-bold text-lg mb-6 text-destructive">Danger Zone</h2>
          <Button variant="destructive" onClick={handleLogout} className="w-full gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  )
}
