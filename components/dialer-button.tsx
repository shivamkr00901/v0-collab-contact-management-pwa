"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Phone, Copy, Check } from "lucide-react"

interface DialerButtonProps {
  phoneNumber: string
  contactName: string
}

export function DialerButton({ phoneNumber, contactName }: DialerButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!phoneNumber) return null

  return (
    <>
      <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={() => setOpen(true)}>
        <Phone className="w-4 h-4" />
        Call
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call {contactName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Phone Number</p>
              <p className="text-lg font-mono font-bold">{phoneNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCall} className="flex-1 gap-2">
                <Phone className="w-4 h-4" />
                Call Now
              </Button>
              <Button onClick={handleCopy} variant="outline" className="flex-1 gap-2 bg-transparent">
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
