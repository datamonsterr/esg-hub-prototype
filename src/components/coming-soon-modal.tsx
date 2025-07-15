"use client"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog"

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Coming Soon</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>This feature is not yet available, but we're working on it!</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 