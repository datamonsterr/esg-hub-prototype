"use client"

import { useState } from "react"
import { Edit, Plus, X, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table"
import { Progress } from "@/src/components/ui/progress"

interface DataValidationProps {
  onNavigateBack: () => void
}

export function DataValidation({ onNavigateBack }: DataValidationProps) {
  const [actors] = useState([
    {
      id: 1,
      title: "Supplier",
      description: "GreenTech Materials",
      color: "bg-blue-50 text-blue-900",
      dotColor: "bg-blue-500",
    },
    {
      id: 2,
      title: "Brand",
      description: "EcoSustain Corp",
      color: "bg-green-50 text-green-900",
      dotColor: "bg-green-500",
    },
  ])

  const [actions, setActions] = useState([
    {
      id: 1,
      title: "Manufacturing",
      code: "MFG-2024-001",
      type: "manufacturing",
      color: "bg-green-100 text-green-800",
    },
    {
      id: 2,
      title: "Transportation",
      code: "TRN-2024-002",
      type: "transportation",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 3,
      title: "Certification",
      code: "CERT-2024-003",
      type: "certification",
      color: "bg-purple-100 text-purple-800",
    },
  ])

  const [artifacts] = useState([
    { id: 1, name: "Materials", code: "Carbon-ORG001", type: "materials", color: "bg-orange-100 text-orange-800" },
    { id: 2, name: "Polyester-REC001", type: "substances", color: "bg-purple-100 text-purple-800" },
    { id: 3, name: "Dye-NAT001", type: "products", color: "bg-blue-100 text-blue-800" },
  ])

  const [showHighlightPrompt, setShowHighlightPrompt] = useState(false)

  const materialsData = [
    {
      id: "MAT-001",
      name: "Organic Cotton",
      origin: "India - Gujarat",
      supplier: "GreenTech Materials",
      certification: "GOTS Certified",
      status: "verified",
    },
    {
      id: "MAT-002",
      name: "Recycled Polyester",
      origin: "Japan - Osaka",
      supplier: "EcoFiber Corp",
      certification: "GRS Certified",
      status: "verified",
    },
    {
      id: "MAT-003",
      name: "Natural Dyes",
      origin: "Peru - Lima",
      supplier: "Natural Colors Ltd",
      certification: "OEKO-TEX",
      status: "pending",
    },
  ]

  const suppliersData = [
    {
      id: "SUP-001",
      company: "GreenTech Materials",
      location: "Mumbai, India",
      contact: "contact@greentech.in",
      compliance: 98,
      status: "verified",
    },
    {
      id: "SUP-002",
      company: "EcoFiber Corp",
      location: "Osaka, Japan",
      contact: "info@ecofiber.jp",
      compliance: 95,
      status: "verified",
    },
  ]

  const certificationsData = [
    {
      id: "CERT-001",
      type: "GOTS",
      issuingBody: "Global Organic Textile Standard",
      issueDate: "2023-01-15",
      expiryDate: "2025-01-15",
      status: "valid",
    },
    {
      id: "CERT-002",
      type: "GRS",
      issuingBody: "Global Recycled Standard",
      issueDate: "2023-03-20",
      expiryDate: "2025-03-20",
      status: "valid",
    },
  ]

  const keyHighlights = [
    {
      title: "100% of raw materials traced to certified sustainable sources",
      percentage: 100,
      status: "success",
      suggestion: "Edit Prompt",
      detail: "Change certification percentage to 98%",
    },
    {
      title: "All supplier certificates validated and up-to-date with 95% compliance",
      percentage: 95,
      status: "info",
      suggestion: "Suggested Prompts",
      detail: "Delete this sentence",
    },
    {
      title: "Complete traceability chain established for 87% of materials",
      percentage: 87,
      status: "warning",
      suggestion: "Edit",
      detail: "Change certification percentage to 90%",
    },
  ]

  const removeAction = (id: number) => {
    setActions(actions.filter((action) => action.id !== id))
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
            {keyHighlights.map((highlight, index) => (
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

        {/* Extracted Data Tables */}
        <div className="space-y-6">
          {/* Materials Table */}
          <Card className="border-border-light rounded-brand">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Materials</CardTitle>
                <CardDescription>Data extracted from Materials sheet</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-border-light rounded-brand bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                Edit Table
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material ID</TableHead>
                    <TableHead>Material Name</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materialsData.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.id}</TableCell>
                      <TableCell>{material.name}</TableCell>
                      <TableCell>{material.origin}</TableCell>
                      <TableCell>{material.supplier}</TableCell>
                      <TableCell>
                        <span className={getStatusColor(material.status)}>{material.certification}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          🗑️
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Suppliers Table */}
          <Card className="border-border-light rounded-brand">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Suppliers</CardTitle>
                <CardDescription>Data extracted from Suppliers sheet</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-border-light rounded-brand bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                Edit Table
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier ID</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Compliance Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliersData.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.id}</TableCell>
                      <TableCell>{supplier.company}</TableCell>
                      <TableCell>{supplier.location}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{supplier.compliance}%</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          🗑️
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Certifications Table */}
          <Card className="border-border-light rounded-brand">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Certifications</CardTitle>
                <CardDescription>Data extracted from Certifications sheet</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-border-light rounded-brand bg-transparent">
                <Edit className="h-4 w-4 mr-2" />
                Edit Table
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issuing Body</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificationsData.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.id}</TableCell>
                      <TableCell>{cert.type}</TableCell>
                      <TableCell>{cert.issuingBody}</TableCell>
                      <TableCell>{cert.issueDate}</TableCell>
                      <TableCell>{cert.expiryDate}</TableCell>
                      <TableCell>
                        <span className={getStatusColor(cert.status)}>{cert.status}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          🗑️
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions Sidebar - 1/3 width */}
      <div className="space-y-6">
        {/* Actors */}
        <Card className="border-border-light rounded-brand">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Actors</CardTitle>
            <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90 rounded-full w-8 h-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {actors.map((actor) => (
              <div key={actor.id} className={`flex items-center justify-between p-3 rounded-brand ${actor.color}`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${actor.dotColor}`}></div>
                  <div>
                    <div className="font-medium text-sm">{actor.title}</div>
                    <div className="text-xs text-gray-600">{actor.description}</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-border-light rounded-brand">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium">Actions</CardTitle>
            <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90 rounded-full w-8 h-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className={`flex items-center justify-between p-3 rounded-brand ${action.color}`}>
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-600">{action.code}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAction(action.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Artifacts */}
        <Card className="border-border-light rounded-brand">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Artifacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {['materials', 'substances', 'products'].map((category) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{category}</span>
                  <Button size="sm" variant="ghost" className="text-brand-primary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {artifacts.filter((a) => a.type === category).map((artifact) => (
                  <div
                    key={artifact.id}
                    className={`flex items-center justify-between p-3 rounded-brand ${artifact.color}`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-sm">{artifact.name}</div>
                        {artifact.code && <div className="text-xs text-gray-600">{artifact.code}</div>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Final Actions */}
        <Card className="border-border-light rounded-brand">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-green-50 rounded-brand">
              <div className="font-medium text-sm text-green-800">Manufacturing</div>
              <div className="text-xs text-green-600">MFG-2024-001</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
