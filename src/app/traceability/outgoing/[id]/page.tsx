"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Heart,
  Bot,
  Mail,
  Network,
  XCircle,
  Send,
  Phone
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { useGetTraceabilityRequest } from '@/src/api/traceability';

export default function TraceabilityRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { request, isLoading, isError } = useGetTraceabilityRequest(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Request Not Found
        </h3>
        <p className="text-gray-600">
          The requested traceability request could not be found.
        </p>
        <Link href="/traceability/outgoing" className="mt-4 inline-block">
          <Button variant="outline">Back to Requests</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'overdue':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/traceability/outgoing"
          className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Manage Requests</span>
        </Link>
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Manage Request ID: {request.id}
          </h1>
          <p className="text-gray-600">
            Track and manage supplier responses for traceability assessment
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Request Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          Request Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Products
            </label>
            <div className="flex flex-wrap gap-1">
              {request.products.map((p) => (
                <Badge
                  key={p.id}
                  variant="secondary"
                  className="bg-gray-100 text-gray-700"
                >
                  {p.name}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Components
            </label>
            <div className="flex flex-wrap gap-1">
              {request.components.map((c) => (
                <Badge
                  key={c.id}
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <span className="text-gray-900">
              {new Date(request.dueDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assessment
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">
                {request.assessmentTemplate.title}
              </span>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cascading Status Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          Cascading Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium text-green-800">
                Tier 2 Cascaded
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {request.cascadedRequests.length}
            </p>
            <p className="text-xs text-green-700">
              Suppliers cascaded to lower tiers
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <span className="text-sm font-medium text-yellow-800">
                Pending Cascade
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">
              {
                request.cascadedRequests.filter(
                  (r) => r.status === 'pending' || r.status === 'in_progress'
                ).length
              }
            </p>
            <p className="text-xs text-yellow-700">Awaiting supplier completion</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-800">
                Total Tier 2
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {request.cascadedRequests.length}
            </p>
            <p className="text-xs text-gray-700">
              Lower tier suppliers identified
            </p>
          </div>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900">
              Suppliers Response Status
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {request.responses?.length || 0} of{' '}
                {request.responses?.length || 0} suppliers
              </span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {request.responses?.map((response) => (
            <div key={response.id} className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100`}
                  >
                    <Network className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {response.respondingOrganizationId}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    className={`text-xs font-medium ${getStatusBadgeStyle(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {response.submittedAt
                      ? `Responded on ${new Date(
                          response.submittedAt
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}`
                      : 'No response yet'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {request.status === 'completed' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-brand-primary text-white hover:bg-brand-primary/90"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View Response
                    </Button>
                    <Button size="sm" variant="secondary">
                      <Heart className="h-3 w-3 mr-1" />
                      Send Thank You
                    </Button>
                    <Button
                      size="sm"
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      Extract with AI
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Follow Up
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Network className="h-3 w-3 mr-1" />
                      View Tier 2
                    </Button>
                  </>
                )}

                {request.status === 'rejected' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      View Rejection
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Send Clarification
                    </Button>
                  </>
                )}

                {request.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send Reminder
                    </Button>
                    <Button size="sm" variant="outline">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact Supplier
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 