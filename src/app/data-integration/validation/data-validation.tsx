"use client"

import { useState } from "react"
import { Edit, Plus, X, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Progress } from "@/src/components/ui/progress"
import { useDataValidation } from '@/src/api/data-integration';
import { GlobalLoading } from '@/src/components/global-loading';
import { KeyHighlight, Actor, Action } from "@/src/types/data-validation"

interface DataValidationProps {
  onNavigateBack: () => void
}

export function DataValidation({ onNavigateBack }: DataValidationProps) {
  const { dataValidation, isLoading, isError } = useDataValidation();
  const [showHighlightPrompt, setShowHighlightPrompt] = useState(false)

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (isError) {
    return <div>Error loading data</div>;
  }

  if (!dataValidation) {
    return null;
  }

  const removeAction = (id: number) => {
    // This will be implemented later
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600"
      case "pending":
        return "text-yellow-600"
      case "valid":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  // Determine background color for key highlights based on status
  const getHighlightBackground = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50"
      case "info":
        return "bg-blue-50"
      case "warning":
        return "bg-yellow-50"
      default:
        return "bg-gray-50"
    }
  }

  return (
    <div className="grid grid-cols-3 gap-8">
      {/* Main Content - 2/3 width */}
      <div className="col-span-2 space-y-8">
        {/* Uploaded File Preview */}
        <Card className="border-border-light rounded-brand">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Uploaded File Preview</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Material_Traceability_Report_2024.pdf</span>
              <span className="text-sm text-gray-500">2.4 MB</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-6 rounded-brand">
              <div className="bg-white p-4 rounded shadow-sm">
                <div className="grid grid-cols-8 gap-2 text-xs mb-4">
                  <div className="font-medium">Material</div>
                  <div className="font-medium">Origin</div>
                  <div className="font-medium">Supplier</div>
                  <div className="font-medium">Cert</div>
                  <div className="font-medium">Date</div>
                  <div className="font-medium">Qty</div>
                  <div className="font-medium">Unit</div>
                  <div className="font-medium">Status</div>
                </div>
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="grid grid-cols-8 gap-2 text-xs py-1 border-b border-gray-200">
                    <div>Cotton</div>
                    <div>India</div>
                    <div>GreenTech</div>
                    <div>GOTS</div>
                    <div>2024-01</div>
                    <div>1000</div>
                    <div>kg</div>
                    <div>✓</div>
                  </div>
                ))}
              </div>
              <p className="text-sm mt-4 text-gray-700">
                This document is the 2024 traceability report of the 200 countries from various authorities, and lists
                the essential data from the supply chain. The report shows comprehensive material sourcing details,
                supplier audit results, certificate validations, and transportation documentation for raw materials and
                finished products.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Document Summary */}
        <Card className="border-border-light rounded-brand">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Document Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              This document contains comprehensive material traceability information including supplier certificates,
              origin documentation, invoice tracking, and compliance verification across the supply chain. The report
              includes material sourcing details, supplier audit results, certificate validations, and transportation
              documentation for raw materials and finished products.
            </p>
          </CardContent>
        </Card>

        {/* Key Highlights */}
        <Card className="border-border-light rounded-brand relative">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Key Highlights</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHighlightPrompt(!showHighlightPrompt)}
              className="border-border-light rounded-brand bg-transparent"
            >
              Edit Prompt
            </Button>
          </CardHeader>
          {showHighlightPrompt && (
            <div className="absolute right-4 top-16 z-20 w-72 bg-white border border-border-light rounded-brand shadow-lg p-4 space-y-2">
              <h3 className="font-medium text-sm">Edit Prompt</h3>
              <textarea className="w-full h-24 border border-border-light rounded p-2 text-sm" placeholder="Enter prompt..." />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHighlightPrompt(false)}
                  className="border-border-light rounded-brand bg-transparent"
                >
                  Cancel
                </Button>
                <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
                  Save
                </Button>
              </div>
            </div>
          )}
          <CardContent className="space-y-4">
            {dataValidation.keyHighlights.map((highlight: KeyHighlight, index: number) => (
              <div key={index} className={`border border-border-light rounded-brand p-4 ${getHighlightBackground(highlight.status)}`}>
                <div className="flex items-start space-x-2 mb-2">
                  {getStatusIcon(highlight.status)}
                  <span className="font-medium">{highlight.percentage}%</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{highlight.title}</p>
                <p className="text-xs text-gray-500">{highlight.detail}</p>
                <Progress value={highlight.percentage} className="mt-2" />
              </div>
            ))}
            <div className="flex space-x-2 mt-4">
              <Button className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">Re-extract Data</Button>
              <Button variant="outline" className="border-border-light rounded-brand bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Tables */}
        <div className="space-y-8">
          <DataTable title="Materials" data={dataValidation.materialsData} columns={["ID", "Name", "Origin", "Supplier", "Certification", "Status"]} />
          <DataTable title="Suppliers" data={dataValidation.suppliersData} columns={["ID", "Company", "Location", "Contact", "Compliance", "Status"]} />
          <DataTable title="Certifications" data={dataValidation.certificationsData} columns={["ID", "Type", "Issuing Body", "Issue Date", "Expiry Date", "Status"]} />
        </div>
      </div>

      {/* Sidebar - 1/3 width */}
      <div className="col-span-1 space-y-8">
        {/* Actors */}
        <Card className="border-border-light rounded-brand">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Actors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataValidation.actors.map((actor: Actor, index: number) => (
              <div key={index} className={`p-3 rounded-brand ${actor.color}`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${actor.dotColor}`}></div>
                  <span className="font-medium text-sm">{actor.title}</span>
                </div>
                <p className="text-xs ml-4">{actor.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-border-light rounded-brand">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataValidation.actions.map((action: Action, index: number) => (
              <div key={index} className={`p-3 rounded-brand ${action.color}`}>
                  <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs">{action.code}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DataTable({ title, data, columns }: { title: string, data: any[], columns: string[] }) {
  return (
        <Card className="border-border-light rounded-brand">
          <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
          </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col: string) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {columns.map((col: string) => (
                  <TableCell key={col}>{row[col.toLowerCase()]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
          </CardContent>
        </Card>
  )
}
