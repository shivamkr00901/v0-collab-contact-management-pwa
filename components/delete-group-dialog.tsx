"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeleteGroupDialogProps {
  groupId: string
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteGroupDialog({ groupId, groupName, open, onOpenChange }: DeleteGroupDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" })

      if (res.ok) {
        toast({ title: "Group deleted successfully" })
        onOpenChange(false)
        router.push("/dashboard")
      } else {
        toast({ title: "Failed to delete group", variant: "destructive" })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({ title: "Error deleting group", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All contacts in "{groupName}" will be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
