"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Filter } from "lucide-react"

interface SortFilterDialogProps {
  onSort: (sortBy: string) => void
  currentSort?: string
}

export function SortFilterDialog({ onSort, currentSort = "name" }: SortFilterDialogProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(currentSort)

  const options = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "recent", label: "Recently Added" },
    { value: "oldest", label: "Oldest First" },
  ]

  const handleSort = (value: string) => {
    setSelected(value)
    onSort(value)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Sort
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] rounded-lg">
        <DialogHeader>
          <DialogTitle>Sort Contacts</DialogTitle>
          <DialogDescription>Choose how to organize your contacts</DialogDescription>
        </DialogHeader>
        <RadioGroup value={selected} onValueChange={handleSort} className="space-y-3 py-4">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </DialogContent>
    </Dialog>
  )
}
