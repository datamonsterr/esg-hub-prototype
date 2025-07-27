'use client';

import { useState } from 'react';
import { useGetIncomingRequests } from '@/src/api/traceability';
import { TraceabilityRequest } from '@/src/types';
import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  Inbox,
  Info,
  Leaf,
  Search
} from 'lucide-react';
import { ErrorComponent } from '@/src/components/ui/error';

export default function SupplierTraceabilityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { incomingRequests: requests, isLoading, isError } = useGetIncomingRequests({
    status: statusFilter !== 'all' ? statusFilter : undefined
  });
  
  if (isError) {
    return (
      <ErrorComponent title="Error" description="An error occurred while loading this page." />
    );
  }
  const filteredRequests =
    requests?.filter((request: TraceabilityRequest) => {
      const matchesSearch =
        request.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.assessmentId.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesSearch;
    }) || [];

  const getStatusStats = () => {
    if (!requests)
      return { total: 0, pending: 0, in_progress: 0, completed: 0, overdue: 0 };

    return {
      total: requests.length,
      pending: requests.filter((r: TraceabilityRequest) => r.status === 'pending')
        .length,
      in_progress: requests.filter(
        (r: TraceabilityRequest) => r.status === 'in_progress'
      ).length,
      completed: requests.filter(
        (r: TraceabilityRequest) => r.status === 'completed'
      ).length,
      overdue: requests.filter((r: TraceabilityRequest) => r.status === 'overdue')
        .length
    };
  };

  const stats = getStatusStats();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-accent/20 text-accent';
      case 'in_progress':
        return 'bg-primary/20 text-primary';
      case 'completed':
        return 'bg-gray-200 text-gray-700';
      case 'overdue':
        return 'bg-error/20 text-error';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return <AlertTriangle className="text-error" />;
      case 'low':
        return <Info className="text-gray-400" />;
      default:
        return <Clock className="text-accent" />;
    }
  };

  const isOverdue = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const getDaysOverdue = (expirationDate: string | null | undefined) => {
    if (!expirationDate) return 0;
    const due = new Date(expirationDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <main className="max-w-7xl mx-auto px-5 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">
            Traceability Requests
          </h1>
          <p className="text-gray-600">
            Complete assessments from brands and supply chain partners
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border">
        {/* Request Statistics */}
        <div className="border-b border-border p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-accent">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">
                {stats.in_progress}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-border">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No traceability requests found</p>
            </div>
          ) : (
            filteredRequests.map((request: TraceabilityRequest) => (
              <Link
                key={request.id}
                href={`/traceability/incoming/${request.id}`}
                className="block p-6 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Leaf className="text-white h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Assessment Request {request.assessmentId}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                        <span>
                          <strong>Request ID:</strong> {request.id}
                        </span>
                        <span>
                          <strong>Assessment:</strong> {request.assessmentId}
                        </span>
                        <span>
                          <strong>Created:</strong>{' '}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPriorityIcon(request.priority)}
                      <span
                        className={`text-sm font-medium ${
                          request.priority === 'high' || request.priority === 'urgent'
                            ? 'text-error'
                            : request.priority === 'low'
                              ? 'text-gray-600'
                              : 'text-accent'
                        }`}
                      >
                        {request.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {request.dueDate ? new Date(request.dueDate).toLocaleDateString() : 'No due date'}
                    </div>
                    {request.dueDate && isOverdue(request.dueDate) &&
                      request.status !== 'completed' && (
                        <div className="text-xs text-error mt-1">
                          {getDaysOverdue(request.dueDate)} days overdue
                        </div>
                      )}
                    {request.status === 'completed' && (
                      <div className="text-xs text-primary mt-1">
                        Submitted
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredRequests.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing 1-{Math.min(6, filteredRequests.length)} of{' '}
            {filteredRequests.length} requests
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-border rounded-lg text-gray-600 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-primary text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 border border-border rounded-lg text-gray-600 hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 border border-border rounded-lg text-gray-600 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
} 