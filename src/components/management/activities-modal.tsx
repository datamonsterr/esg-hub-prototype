"use client"

import { useGetActivities } from "@/src/api/management"
import { GlobalLoading } from "@/src/components/global-loading"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog"
import { ErrorComponent } from "@/src/components/ui/error"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { IntegrationActivity } from "@/src/types/integration"
import { format } from "date-fns"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { useMemo, useState } from "react"

interface ActivitiesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ActivitiesModal({ isOpen, onClose }: ActivitiesModalProps) {
  const { activities, isLoading, isError } = useGetActivities()
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")

  const filteredAndSortedActivities = useMemo(() => {
    if (!activities) return []

    let filtered = activities
    if (statusFilter !== "all") {
      filtered = activities.filter(activity => activity.status === statusFilter)
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })
  }, [activities, statusFilter, sortOrder])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>All Activities</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-between items-center py-4">
          <div className="flex space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading && <GlobalLoading />}
          {isError && <ErrorComponent title="Error" description="Could not load activities." />}
          {filteredAndSortedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-brand">
              {getStatusIcon(activity.status)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                <p className="text-sm text-gray-600">
                  {activity.subtitle} • {format(new Date(activity.createdAt), "PPP p")}
                </p>
              </div>
              {getStatusBadge(activity.status)}
            </div>
          ))}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 