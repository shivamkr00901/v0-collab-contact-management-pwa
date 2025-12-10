"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          router.push("/dashboard")
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">𝐂</span>
            </div>
            <span className="font-bold text-xl">Collab</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 space-y-12">
        <div className="text-center space-y-6 animate-float-in">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Shared Contacts, Sync'd Vibes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Keep your group's contacts in one place. Add, edit, and sync instantly with everyone in your circle. No more
            scattered numbers.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 animate-pulse-glow"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-lg px-8 border-2 bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              icon: "👥",
              title: "Group Contacts",
              desc: "Create groups and invite friends to share contacts effortlessly",
            },
            {
              icon: "⚡",
              title: "Real-time Sync",
              desc: "Changes appear instantly for everyone in your group",
            },
            {
              icon: "📱",
              title: "Works Offline",
              desc: "Access your contacts even without internet connection",
            },
            {
              icon: "🔒",
              title: "Secure & Private",
              desc: "Your data is encrypted and only shared with your group",
            },
            {
              icon: "⬆️",
              title: "Quick Import",
              desc: "Import contacts from your phone in seconds",
            },
            {
              icon: "✨",
              title: "Gen Z Vibes",
              desc: "Modern, sleek design that just works",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>Built with 💜 for your group | © 2025 Collab</p>
        </div>
      </div>
    </div>
  )
}
