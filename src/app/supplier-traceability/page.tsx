'use client';

import { useState } from 'react';
import { useTraceabilityRequests } from '@/src/api/traceability';
import { TraceabilityRequest } from '@/src/types/traceability';
import Link from 'next/link';

export default function SupplierTraceabilityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { requests, isLoading, isError } = useTraceabilityRequests();

  const filteredRequests = requests?.filter((request: TraceabilityRequest) => {
    const matchesSearch = request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.assessmentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusStats = () => {
    if (!requests) return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
    
    return {
      total: requests.length,
      pending: requests.filter((r: TraceabilityRequest) => r.status === 'Pending').length,
      inProgress: requests.filter((r: TraceabilityRequest) => r.status === 'In Progress').length,
      completed: requests.filter((r: TraceabilityRequest) => r.status === 'Completed').length,
      overdue: requests.filter((r: TraceabilityRequest) => r.status === 'Overdue').length,
    };
  };

  const stats = getStatusStats();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-accent/20 text-accent';
      case 'In Progress':
        return 'bg-primary/20 text-primary';
      case 'Completed':
        return 'bg-gray-200 text-gray-700';
      case 'Overdue':
        return 'bg-error/20 text-error';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPriorityIcon = (cascadeType: string) => {
    switch (cascadeType) {
      case 'required':
        return <i className="fas fa-exclamation-triangle text-error"></i>;
      case 'optional':
        return <i className="fas fa-info-circle text-gray-400"></i>;
      default:
        return <i className="fas fa-clock text-accent"></i>;
    }
  };

  const isOverdue = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const getDaysOverdue = (expirationDate: string) => {
    const due = new Date(expirationDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressPercentage = (progress: { responded: number; total: number }) => {
    if (progress.total === 0) return 0;
    return Math.round((progress.responded / progress.total) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-error">Failed to load traceability requests. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-5 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Traceability Requests</h1>
          <p className="text-gray-600">Complete assessments from brands and supply chain partners</p>
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
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
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
              <div className="text-2xl font-medium text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-accent">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-primary">{stats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-border">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No traceability requests found</p>
            </div>
          ) : (
            filteredRequests.map((request: TraceabilityRequest) => (
              <Link
                key={request.id}
                href={`/supplier-traceability/${request.id}`}
                className="block p-6 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <i className="fas fa-leaf text-white text-lg"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Assessment Request {request.assessmentId}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                        <span><strong>Request ID:</strong> {request.id}</span>
                        <span><strong>Assessment:</strong> {request.assessmentId}</span>
                        <span><strong>Created:</strong> {new Date(request.createdDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Artifact Tags:</span>
                        {request.artifactTags.map((tag, index) => (
                          <span key={index} className="bg-secondary text-gray-700 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {request.actionTags.map((tag, index) => (
                          <span key={index} className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPriorityIcon(request.cascadeSettings.type)}
                      <span className={`text-sm font-medium ${
                        request.cascadeSettings.type === 'required' ? 'text-error' : 
                        request.cascadeSettings.type === 'optional' ? 'text-gray-600' : 'text-accent'
                      }`}>
                        {request.cascadeSettings.type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(request.expirationDate).toLocaleDateString()}
                    </div>
                    {isOverdue(request.expirationDate) && request.status !== 'Completed' && (
                      <div className="text-xs text-error mt-1">
                        {getDaysOverdue(request.expirationDate)} days overdue
                      </div>
                    )}
                    {request.status === 'In Progress' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {getProgressPercentage(request.progress)}% complete
                      </div>
                    )}
                    {request.status === 'Completed' && (
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
            Showing 1-{Math.min(6, filteredRequests.length)} of {filteredRequests.length} requests
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 border border-border rounded-lg text-gray-600 hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-2 bg-primary text-white rounded-lg">1</button>
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