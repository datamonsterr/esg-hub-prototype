"use client"

import { useState } from "react"
import { useGetDocumentSummary } from "@/src/api/integration"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { KeyMetric } from "@/src/types/data-integration"
import { Progress } from "@/src/components/ui/progress"
import { FileText, Calendar, Building, Users, CheckCircle } from "lucide-react"

interface DocumentSummaryProps {
  contentUrl: string | undefined
  fileName?: string
}

export function DocumentSummary({ contentUrl, fileName }: DocumentSummaryProps) {
  const {
    documentSummary,
    isLoading,
    isError,
  } = useGetDocumentSummary(contentUrl)
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false)

  if (isLoading) return <div>Loading document summary...</div>
  if (isError) return <div>Error loading document summary.</div>
  if (!documentSummary) return null

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowSummaryPrompt(!showSummaryPrompt)}
        className="absolute top-[-48px] right-0 border-border-light rounded-brand bg-transparent"
      >
        Edit Summary
      </Button>
      {showSummaryPrompt && (
        <div className="absolute right-0 top-[-8px] z-20 w-72 bg-white border border-border-light rounded-brand shadow-lg p-4 space-y-2">
          <h3 className="font-medium text-sm">Edit Summary</h3>
          <textarea
            className="w-full h-24 border border-border-light rounded p-2 text-sm"
            placeholder="Enter summary..."
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSummaryPrompt(false)}
              className="border-border-light rounded-brand bg-transparent"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand"
            >
              Save
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Document Overview */}
        <div className="border border-border-light rounded-brand p-4 bg-gray-50">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-sm">Document Overview</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            {documentSummary.description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {documentSummary.reportingPeriod}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {documentSummary.organizationCount} Organizations
              </span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="border border-border-light rounded-brand p-4 bg-green-50">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-medium text-sm">Key Metrics</h3>
          </div>
          <div className="space-y-3">
            {documentSummary.keyMetrics.map((metric: KeyMetric, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{metric.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {metric.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{metric.value}</span>
                  <span className="text-xs text-gray-500">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Quality */}
        <div className="border border-border-light rounded-brand p-4 bg-blue-50">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-sm">Data Quality Assessment</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Data Completeness</span>
              <span className="text-sm font-medium">{documentSummary.dataQuality.completeness}%</span>
            </div>
            <Progress value={documentSummary.dataQuality.completeness} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Data Accuracy</span>
              <span className="text-sm font-medium">{documentSummary.dataQuality.accuracy}%</span>
            </div>
            <Progress value={documentSummary.dataQuality.accuracy} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Data Consistency</span>
              <span className="text-sm font-medium">{documentSummary.dataQuality.consistency}%</span>
            </div>
            <Progress value={documentSummary.dataQuality.consistency} className="h-2" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-4">
          <Button className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
            Generate Report
          </Button>
          <Button
            variant="outline"
            className="border-border-light rounded-brand bg-transparent"
          >
            Export Data
          </Button>
        </div>
      </div>
    </div>
  )
} 