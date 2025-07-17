"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { useGetOutgoingRequests } from "@/src/api/traceability"
import { ErrorComponent } from "@/src/components/ui/error"

export default function TraceabilityRequestsPage() {
  const { outgoingRequests, isLoading, isError } = useGetOutgoingRequests()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [supplierFilter, setSupplierFilter] = useState("all")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorComponent title="Error" description="An error occurred while loading this page." />
    )
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "in_progress":
        return "bg-yellow-100 text-yellow-700"
      case "overdue":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-gray-100 text-gray-700"
      case "rejected":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Traceability Requests</h1>
          <p className="text-gray-600">Manage traceability requests and track supplier responses for material assessment</p>
        </div>
        <Link href="/traceability/outgoing/create">
          <Button className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create New Request
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by Request ID, Supplier, or Assessment..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="min-w-32">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="supplier-a">Supplier A</SelectItem>
                <SelectItem value="supplier-b">Supplier B</SelectItem>
                <SelectItem value="supplier-c">Supplier C</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 font-medium text-gray-900 w-32">Request ID</th>
                <th className="text-left py-4 px-4 font-medium text-gray-900 w-48">Suppliers</th>
                <th className="text-left py-4 px-4 font-medium text-gray-900 w-40">Assessment ID</th>
                <th className="text-left py-4 px-4 font-medium text-gray-900 w-28">Status</th>
                <th className="text-left py-4 px-4 font-medium text-gray-900 w-32">Created Date</th>
                <th className="text-left py-4 px-4 font-medium text-gray-900 w-32">Last Updated</th>
                <th className="text-left py-4 px-4 font-medium text-gray-900 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {outgoingRequests?.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-medium text-brand-primary">{request.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900">{request.targetOrganizationId}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900">{request.assessmentTemplateId}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={`text-xs ${getStatusBadgeStyle(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 text-sm">
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900 text-sm">
                      {new Date(request.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Link href={`/traceability/request/${request.id}`}>
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Delete" className="text-red-600 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to <span className="font-medium">{outgoingRequests?.length || 0}</span> of <span className="font-medium">{outgoingRequests?.length || 0}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button size="sm" className="bg-brand-primary text-white">1</Button>
          <Button variant="outline" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <span className="text-sm text-gray-500">...</span>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
} 