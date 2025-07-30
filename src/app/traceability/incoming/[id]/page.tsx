'use client';

import { endpoints } from '@/src/api/axios';
import { useGetTraceabilityRequest } from '@/src/api/traceability';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Route,
  Share2
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';


export default function SupplierTraceabilityDetailPage({}) {
  const router = useRouter();
  const params = useParams();
  const { request, isLoading, isError } = useGetTraceabilityRequest(String(params.id));
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [assessmentStarted, setAssessmentStarted] = useState(false);

  // Mock supplier data for cascading
  const availableSuppliers = [
    {
      id: 'sup-101',
      name: 'Leather Suppliers Co.',
      category: 'Raw Materials',
      materials: 'Leather, Synthetic',
      tier: 'Tier 2'
    },
    {
      id: 'sup-102',
      name: 'Rubber Processing Ltd.',
      category: 'Processing',
      materials: 'Rubber, Sole Components',
      tier: 'Tier 2'
    },
    {
      id: 'sup-103',
      name: 'Textile Weaving Inc.',
      category: 'Textile',
      materials: 'Cotton, Polyester Blend',
      tier: 'Tier 2'
    },
    {
      id: 'sup-104',
      name: 'Metal Hardware Corp.',
      category: 'Hardware',
      materials: 'Eyelets, Buckles, Zippers',
      tier: 'Tier 2'
    },
    {
      id: 'sup-105',
      name: 'Adhesive Solutions Ltd.',
      category: 'Chemicals',
      materials: 'Glues, Bonding Agents',
      tier: 'Tier 2'
    },
    {
      id: 'sup-106',
      name: 'Foam & Padding Co.',
      category: 'Comfort',
      materials: 'EVA Foam, Memory Foam',
      tier: 'Tier 2'
    },
    {
      id: 'sup-107',
      name: 'Dye & Finishing Works',
      category: 'Finishing',
      materials: 'Dyes, Protective Coatings',
      tier: 'Tier 2'
    },
    {
      id: 'sup-108',
      name: 'Packaging Materials Inc.',
      category: 'Packaging',
      materials: 'Boxes, Labels, Tissue',
      tier: 'Tier 2'
    }
  ];

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleStartCascading = () => {
    // In a real app, this would start the cascading process
    
  };

  const handleStartAssessment = () => {
    setAssessmentStarted(true);
    // Redirect to traceability-specific assessment page
    router.push(endpoints.assessment.id('1'));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-8">
        <div className="bg-error/10 border border-error/20 rounded-lg p-4">
          <p className="text-error">
            Failed to load traceability request. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(request.dueDate || '') < new Date();
  const daysUntilDue = Math.ceil(
    (new Date(request.dueDate || '').getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <main className="max-w-7xl mx-auto px-5 py-8">
      {/* Request Header */}
      <div className="bg-white rounded-lg border border-border p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Route className="text-white h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-900 mb-2">
                Traceability Assessment Request
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span>Request ID: {request.id}</span>
                <span>•</span>
                <span>Assessment: {request.assessment.templateId}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${request.priority === 'high' || request.priority === 'urgent'
                        ? 'bg-error'
                        : 'bg-gray-400'
                      }`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${request.priority === 'high' || request.priority === 'urgent'
                        ? 'text-error'
                        : 'text-gray-600'
                      }`}
                  >
                    {request.priority === 'high' || request.priority === 'urgent'
                      ? 'Mandatory Assessment'
                      : 'Optional Assessment'}
                  </span>
                </div>
                {request.cascadeSettings.enableCascade && (
                  <div className="flex items-center space-x-2">
                    <Share2 className="text-accent h-4 w-4" />
                    <span className="text-sm text-accent font-medium">
                      Cascading Required
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${isOverdue
                    ? 'bg-error/20 text-error'
                    : 'bg-accent/20 text-accent'
                  }`}
              >
                {isOverdue ? (
                  <AlertTriangle className="h-4 w-4 mr-1 inline-block" />
                ) : (
                  <Clock className="h-4 w-4 mr-1 inline-block" />
                )}
                {isOverdue
                  ? `${Math.abs(daysUntilDue)} days overdue`
                  : `${daysUntilDue} days left`}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Due: {new Date(request.dueDate || '').toLocaleDateString()}
            </p>
          </div>
        </div>

        {request.message && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">
              Message from Brand
            </h3>
            <p className="text-gray-700 leading-relaxed">{request.message}</p>
          </div>
        )}

        {/* Cascading Information */}
        {request.cascadeSettings.enableCascade && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3">
              <Share2 className="text-accent h-5 w-5 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Cascading Requirements
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  This assessment must be cascaded to your lower tier suppliers
                  as part of the traceability requirements.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      <strong>Target Tiers:</strong>{' '}
                      {request.cascadeSettings.targetTiers.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      <strong>Scope:</strong>{' '}
                      {request.cascadeSettings.cascadeScope}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      <strong>Timing:</strong>{' '}
                      {request.cascadeSettings.cascadeTiming}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cascading Section */}
      {request.cascadeSettings.enableCascade && (
        <div className="bg-white rounded-lg border border-border mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  <Share2 className="text-accent h-5 w-5" />
                  <span>Cascading to Suppliers</span>
                </h3>
                <p className="text-gray-600">
                  Select Tier 2 suppliers to cascade this assessment
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Material-Related Suppliers
                </h4>

                <div className="max-h-64 overflow-y-auto border border-border rounded-lg p-3 bg-gray-50">
                  <div className="space-y-3">
                    {availableSuppliers.map((supplier) => (
                      <label
                        key={supplier.id}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          checked={selectedSuppliers.includes(supplier.id)}
                          onChange={() => handleSupplierToggle(supplier.id)}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <span className="text-gray-900 font-medium">
                              {supplier.name}
                            </span>
                            <span className="text-gray-500 text-sm block">
                              Category: {supplier.category} | Materials:{' '}
                              {supplier.materials}
                            </span>
                          </div>
                          <span className="bg-secondary text-gray-700 px-2 py-1 rounded text-xs">
                            {supplier.tier}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Selected Suppliers for Cascading
                </h4>
                <div className="min-h-16 bg-gray-50 rounded-lg p-3">
                  {selectedSuppliers.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center">
                      No suppliers selected yet
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSuppliers.map((supplierId) => {
                        const supplier = availableSuppliers.find(
                          (s) => s.id === supplierId
                        );
                        return supplier ? (
                          <span
                            key={supplierId}
                            className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                          >
                            {supplier.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <HelpCircle className="text-accent h-5 w-5" />
                  <span className="font-medium text-gray-900">
                    Cascading Timeline
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  Selected suppliers will receive the assessment within 24 hours
                  and have 14 days to complete it.
                </p>
              </div>

              <div className="flex items-center justify-center pt-4">
                <button
                  onClick={handleStartCascading}
                  disabled={selectedSuppliers.length === 0}
                  className="bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent/90 flex items-center space-x-2 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Start Cascading Process</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Section */}
      <div className="bg-white rounded-lg border border-border">
        <div className="border-b border-border p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Assessment Overview
              </h2>
              <p className="text-gray-600">
                Complete the traceability assessment to fulfill brand
                requirements
              </p>
            </div>
            <div className="text-right">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${request.status === 'completed'
                    ? 'bg-primary/20 text-primary'
                    : request.status === 'in_progress'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-gray-200 text-gray-700'
                  }`}
              >
                {request.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 mr-1 inline-block" />
                ) : (
                  <FileText className="h-4 w-4 mr-1 inline-block" />
                )}
                {request.status.replace('_', ' ')}
              </div>
              <p className="text-sm text-gray-500">
                Status: {request.status.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Assessment
              </h4>
              <p className="text-lg font-medium text-gray-900">
                {request.assessment.title}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Requesting Brand
              </h4>
              <p className="text-lg font-medium text-gray-900">
                {request.requestingOrganization.name}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Products in Scope
              </h4>
              <p className="text-lg font-medium text-gray-900">
                {request.products.map((p) => p.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to start the assessment?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Click the button below to begin the assessment. You can save your
              progress and return to complete it later.
            </p>
            <button
              onClick={handleStartAssessment}
              disabled={assessmentStarted}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 flex items-center space-x-2 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <span>
                {assessmentStarted
                  ? 'Redirecting to Assessment...'
                  : 'Start Assessment'}
              </span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 