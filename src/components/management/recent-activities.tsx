"use client"

import { useGetActivities } from "@/src/api/management"
import { IntegrationActivity, IntegrationActivityClient } from "@/src/types/integration"
import { format } from "date-fns"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { GlobalLoading } from "@/src/components/global-loading"
import { ErrorComponent } from "@/src/components/ui/error"

export function RecentActivities() {
  const { activities, isLoading, isError } = useGetActivities(3)

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

  if (isLoading) return <GlobalLoading />
  if (isError) return <ErrorComponent title="Error" description="Could not load recent activities." />

  return (
    <div className="space-y-4">
      {activities && activities.length > 0 ? (
        activities.map((activity: IntegrationActivityClient) => (
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
        ))
      ) : (
        <div className="text-gray-500 text-sm">No recent activities.</div>
      )}
    </div>
  )
} 