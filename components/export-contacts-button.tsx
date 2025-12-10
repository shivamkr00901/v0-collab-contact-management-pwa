"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportContactsButtonProps {
  groupId: string
  groupName: string
}

export function ExportContactsButton({ groupId, groupName }: ExportContactsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleExport = async (format: "csv" | "json") => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/contacts/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, format }),
      })

      if (!res.ok) {
        toast({ title: "Export failed", variant: "destructive" })
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `contacts-${groupName}-${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({ title: `Contacts exported as ${format.toUpperCase()}` })
    } catch (error) {
      toast({ title: "Export error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={isLoading} className="gap-2">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("json")} disabled={isLoading} className="gap-2">
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        JSON
      </Button>
    </div>
  )
}
