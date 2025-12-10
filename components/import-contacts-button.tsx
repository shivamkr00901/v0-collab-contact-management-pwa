"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportContactsButtonProps {
  groupId: string
  onImported: (contacts: any[]) => void
}

export function ImportContactsButton({ groupId, onImported }: ImportContactsButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      toast({ title: "Only CSV and JSON files are supported", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("groupId", groupId)

      const res = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast({ title: data.error || "Import failed", variant: "destructive" })
        return
      }

      onImported(data.imported)
      toast({ title: `${data.count} contacts imported successfully` })
    } catch (error) {
      toast({ title: "Import error", variant: "destructive" })
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileChange} className="hidden" />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Import
      </Button>
    </>
  )
}
