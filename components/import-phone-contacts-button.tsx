"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Smartphone, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImportPhoneContactsButtonProps {
  groupId: string
  onImported: (contacts: any[]) => void
}

export function ImportPhoneContactsButton({ groupId, onImported }: ImportPhoneContactsButtonProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleImportContacts = async () => {
    setIsLoading(true)
    try {
      // Check if Contacts API is supported
      if (!("contacts" in navigator)) {
        toast({
          title: "Contacts API not supported",
          description: "Your browser doesn't support importing contacts",
          variant: "destructive",
        })
        return
      }

      // Request read permission
      const contacts = await (navigator as any).contacts.select(["name", "tel", "email"], { multiple: true })

      if (!contacts || contacts.length === 0) {
        toast({ title: "No contacts selected" })
        return
      }

      // Convert contacts to app format and add to group
      const formattedContacts = contacts
        .map((contact: any) => ({
          name: contact.name?.[0] || "Unknown",
          phone_number: contact.tel?.[0] || undefined,
          email: contact.email?.[0] || undefined,
        }))
        .filter((c: any) => c.name !== "Unknown" || c.phone_number || c.email)

      if (formattedContacts.length === 0) {
        toast({ title: "No valid contacts found" })
        return
      }

      // Add each contact to the group
      const addedContacts = []
      for (const contact of formattedContacts) {
        try {
          const res = await fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groupId,
              name: contact.name,
              phone_number: contact.phone_number,
              email: contact.email,
            }),
          })

          if (res.ok) {
            const data = await res.json()
            addedContacts.push(data.contact)
          }
        } catch (err) {
          console.error("Error adding contact:", err)
        }
      }

      onImported(addedContacts)
      toast({
        title: `${addedContacts.length} contacts imported from phone`,
      })
      setOpen(false)
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Import error:", error)
        toast({
          title: "Import failed",
          description: error.message || "Unable to import contacts from phone",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Smartphone className="w-4 h-4" />
        From Phone
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Contacts from Phone</DialogTitle>
            <DialogDescription>Select contacts from your device to add to this group</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center space-y-4">
            <Smartphone className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You'll be prompted to select contacts from your device</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportContacts} disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
