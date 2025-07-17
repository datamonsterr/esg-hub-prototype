"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, WandIcon, Plus, X, Eye, Send } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Checkbox } from "@/src/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Badge } from "@/src/components/ui/badge"

import { useCreateTraceabilityRequest } from "@/src/api/traceability"
import { useSearchAssessments } from "@/src/api/assessment"
import { useGetProducts, useGetMaterialCodes, useGetSuppliers } from "@/src/api/product"
import { CreateTraceabilityRequest, CascadeSettings } from "@/src/types/traceability"

export default function CreateTraceabilityRequestPage() {
  const { assessments, isLoading: isLoadingAssessments } = useSearchAssessments()
  const { createTraceabilityRequest } = useCreateTraceabilityRequest()

  // Hardcoded orgId for demo; replace with real org context if available
  const organizationId = "org-001"
  const { suppliers, isLoading: isLoadingSuppliers } = useGetSuppliers(organizationId)
  const { materialCodes, isLoading: isLoadingMaterials } = useGetMaterialCodes()
  const { products, isLoading: isLoadingProducts } = useGetProducts({ organizationId })

  // Form state
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [assessmentId, setAssessmentId] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [expirationTime, setExpirationTime] = useState("")
  const [selectedMaterialCodes, setSelectedMaterialCodes] = useState<string[]>([])
  const [selectedProductCodes, setSelectedProductCodes] = useState<string[]>([])
  const [selectedActionCodes, setSelectedActionCodes] = useState<string[]>(["ACT-001", "ACT-002"])
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isCreating, setIsCreating] = useState(false)

  // Cascade settings
  const [cascadeSettings, setCascadeSettings] = useState<CascadeSettings>({
    enableCascade: false,
    targetTiers: [],
    cascadeScope: "material-specific",
    cascadeTiming: "immediate",
    autoReminder: false,
  })
  const [completionNotification, setCompletionNotification] = useState(true)

  const filteredSuppliers = (suppliers || []).filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || supplier.category.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const handleSupplierToggle = (supplierId: string) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    )
  }

  const removeTag = (setState: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setState(prev => prev.filter(item => item !== value))
  }

  const handleSubmit = async () => {
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier')
      return
    }
    if (!assessmentId) {
      alert('Please select an assessment')
      return
    }
    const selectedAssessment = assessments?.find(a => a.id === assessmentId)
    if (!selectedAssessment) {
      alert('Selected assessment not found')
      return
    }
    if (selectedAssessment.status !== 'Complete') {
      alert('Only completed assessments can be used for traceability requests')
      return
    }
    if (!expirationDate) {
      alert('Please set an expiration date')
      return
    }
    setIsCreating(true)
    const requestData: CreateTraceabilityRequest = {
      targetOrganizationId: selectedSuppliers[0], // Only one supplier supported in type
      productIds: selectedProductCodes,
      componentIds: selectedMaterialCodes,
      assessmentTemplateId: assessmentId,
      priority: "high",
      dueDate: `${expirationDate}T${expirationTime || '00:00'}:00Z`,
      message: message || undefined,
      cascadeSettings: {
        ...cascadeSettings,
        // Add completionNotification as custom field if needed
      },
    }
    try {
      await createTraceabilityRequest(requestData)
      alert('Request created successfully!')
      window.location.href = '/traceability/request'
    } catch (error) {
      alert('Failed to create request. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Create New Traceability Request</h1>
          <p className="text-gray-600">Set up a new traceability assessment request for your suppliers</p>
        </div>
        <Link href="/traceability/outgoing" className="text-gray-600 hover:text-brand-primary flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Requests</span>
        </Link>
      </div>

      {/* Create Request Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="space-y-8">
          {/* Suppliers Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Suppliers</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search suppliers..."
                      className="pl-10 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-1/4">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="textile">Textile</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="raw materials">Raw Materials</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600">
                  <WandIcon className="h-4 w-4 mr-2" />
                  AI Suggest
                </Button>
              </div>
              <div className="border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {filteredSuppliers.map((supplier) => (
                    <Label key={supplier.id} className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox
                        checked={selectedSuppliers.includes(supplier.id)}
                        onCheckedChange={() => handleSupplierToggle(supplier.id)}
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 font-medium">{supplier.name}</span>
                        <span className="text-gray-500 text-sm block">
                          Category: {supplier.category} | Location: {supplier.location}
                        </span>
                      </div>
                    </Label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Selection</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select an existing completed assessment to include in this traceability request. Only completed assessments are available for traceability requests.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Select value={assessmentId} onValueChange={setAssessmentId} disabled={isLoadingAssessments}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={isLoadingAssessments ? "Loading assessments..." : "Select an existing assessment"} />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments?.filter(assessment => assessment.status === 'Complete').map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{assessment.id} - {assessment.title}</span>
                          <span className="text-sm text-gray-500">{assessment.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  disabled={!assessmentId}
                  onClick={() => {
                    if (assessmentId) {
                      window.open(`/supplier-assessment/preview/${assessmentId}`, '_blank');
                    }
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              {/* Selected Assessment Info */}
              {assessmentId && assessments && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {(() => {
                    const selectedAssessment = assessments.find(a => a.id === assessmentId)
                    if (!selectedAssessment) return null
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{selectedAssessment.title}</h4>
                          <Badge variant="secondary">{selectedAssessment.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{selectedAssessment.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Created by: {selectedAssessment.creator}</span>
                          <span>•</span>
                          <span>Created: {new Date(selectedAssessment.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Topic: {selectedAssessment.topic}</span>
                        </div>
                        {selectedAssessment.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedAssessment.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
              {/* No Assessments Available Message */}
              {!isLoadingAssessments && assessments && assessments.filter(assessment => assessment.status === 'Complete').length === 0 && (
                <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="text-gray-400 mb-2">
                    <i className="fas fa-clipboard-list text-2xl"></i>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">No completed assessments available</p>
                  <p className="text-xs text-gray-500 mb-4">Create a new assessment and complete it before creating traceability requests.</p>
                  <Link
                    href="/supplier-assessment/create"
                    className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Assessment
                  </Link>
                </div>
              )}
              {/* Create New Assessment Link */}
              {!isLoadingAssessments && assessments && assessments.filter(assessment => assessment.status === 'Complete').length > 0 && (
                <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Don't see the assessment you need?</p>
                  <Link
                    href="/supplier-assessment/create"
                    className="text-brand-primary hover:text-brand-primary/80 font-medium text-sm inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create New Assessment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expiration Date</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Deadline</Label>
                <Input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Time</Label>
                <Input
                  type="time"
                  value={expirationTime}
                  onChange={(e) => setExpirationTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tagging Artifacts */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tagging Artifacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Material Codes</Label>
                <Select onValueChange={(value) => setSelectedMaterialCodes(prev => prev.includes(value) ? prev : [...prev, value])}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingMaterials ? "Loading..." : "Select or add material code"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(materialCodes || []).map((code) => (
                      <SelectItem key={code.id} value={code.code}>
                        {code.code} - {code.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedMaterialCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="flex items-center gap-1">
                      {code}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeTag(setSelectedMaterialCodes, code)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">Product Codes</Label>
                <Select onValueChange={(value) => setSelectedProductCodes(prev => prev.includes(value) ? prev : [...prev, value])}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingProducts ? "Loading..." : "Select or add product code"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(products || []).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.id} - {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedProductCodes.map((code) => (
                    <Badge key={code} variant="secondary" className="flex items-center gap-1">
                      {code}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeTag(setSelectedProductCodes, code)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tagging Actions */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tagging Actions</h3>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Action Codes</Label>
              <Select onValueChange={(value) => setSelectedActionCodes(prev => prev.includes(value) ? prev : [...prev, value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or add action code" />
                </SelectTrigger>
                <SelectContent>
                  {/* actionCodes is removed, so this will be empty or need to be re-added */}
                  {/* For now, keeping the structure but it will be empty */}
                </SelectContent>
              </Select>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedActionCodes.map((code) => (
                  <Badge key={code} variant="secondary" className="flex items-center gap-1">
                    {code}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-600"
                      onClick={() => removeTag(setSelectedActionCodes, code)}
                    />
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">Enter action codes associated with this assessment</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Message for Suppliers</h3>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</Label>
              <Textarea
                rows={4}
                placeholder="Write a message to your suppliers about this assessment..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">This message will be sent to all selected suppliers along with the assessment request</p>
            </div>
          </div>

          {/* Supplier Tier Cascade Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <span>Supplier Tier Cascade Options</span>
            </h3>
            <p className="text-gray-600 text-sm mb-6">Configure how this assessment will be cascaded to lower tier suppliers in your supply chain network.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cascade Requirement */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Cascade Requirement</h4>
                <RadioGroup
                  value={cascadeSettings.enableCascade ? (cascadeSettings.targetTiers.length > 0 ? 'required' : 'optional') : 'none'}
                  onValueChange={(value: 'required' | 'optional' | 'none') => {
                    if (value === 'required') {
                      setCascadeSettings(prev => ({ ...prev, enableCascade: true }))
                    } else if (value === 'optional') {
                      setCascadeSettings(prev => ({ ...prev, enableCascade: true }))
                    } else {
                      setCascadeSettings(prev => ({ ...prev, enableCascade: false, targetTiers: [] }))
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="required" id="required-cascade" />
                    <Label htmlFor="required-cascade" className="text-sm">Required cascading to lower tiers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="optional" id="optional-cascade" />
                    <Label htmlFor="optional-cascade" className="text-sm">Optional cascading to lower tiers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="no-cascade" />
                    <Label htmlFor="no-cascade" className="text-sm">No cascading (Tier 1 only)</Label>
                  </div>
                </RadioGroup>
              </div>
              {/* Tier Selection */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Target Tiers</h4>
                <div className="space-y-3">
                  {['tier-2', 'tier-3', 'tier-4-plus'].map((tier) => (
                    <Label key={tier} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={cascadeSettings.targetTiers.includes(tier)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCascadeSettings(prev => ({
                              ...prev,
                              targetTiers: [...prev.targetTiers, tier],
                              enableCascade: true
                            }))
                          } else {
                            setCascadeSettings(prev => ({
                              ...prev,
                              targetTiers: prev.targetTiers.filter(t => t !== tier)
                            }))
                          }
                        }}
                      />
                      <span className="text-sm">
                        {tier === 'tier-2' ? "Tier 2 (Suppliers' suppliers)" :
                          tier === 'tier-3' ? 'Tier 3 (Sub-suppliers)' :
                            'Tier 4+ (Extended network)'}
                      </span>
                    </Label>
                  ))}
                </div>
              </div>
              {/* Scope Selection */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Cascade Scope</h4>
                <RadioGroup
                  value={cascadeSettings.cascadeScope}
                  onValueChange={(value: 'material-specific' | 'all' | 'risk-based') =>
                    setCascadeSettings(prev => ({ ...prev, cascadeScope: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="material-specific" id="material-specific" />
                    <Label htmlFor="material-specific" className="text-sm">Material/Product specific suppliers only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all-suppliers" />
                    <Label htmlFor="all-suppliers" className="text-sm">All suppliers in selected tiers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="risk-based" id="risk-based" />
                    <Label htmlFor="risk-based" className="text-sm">Risk-based supplier selection</Label>
                  </div>
                </RadioGroup>
              </div>
              {/* Cascade Timing */}
              <div className="border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Cascade Timing</h4>
                <Select
                  value={cascadeSettings.cascadeTiming}
                  onValueChange={(value: 'immediate' | 'after-response' | 'manual' | '7-days' | '14-days' | '30-days') =>
                    setCascadeSettings(prev => ({ ...prev, cascadeTiming: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate upon assessment creation</SelectItem>
                    <SelectItem value="after-response">When Tier 1 suppliers complete assessment</SelectItem>
                    <SelectItem value="7-days">7 days after Tier 1 completion</SelectItem>
                    <SelectItem value="14-days">14 days after Tier 1 completion</SelectItem>
                    <SelectItem value="30-days">30 days after Tier 1 completion</SelectItem>
                    <SelectItem value="manual">Manual trigger only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Additional Settings */}
            <div className="mt-4 border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Settings</h4>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={cascadeSettings.autoReminder}
                    onCheckedChange={(checked) => setCascadeSettings(prev => ({ ...prev, autoReminder: !!checked }))}
                  />
                  <Label className="text-sm">Send automated reminders</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={completionNotification}
                    onCheckedChange={(checked) => setCompletionNotification(!!checked)}
                  />
                  <Label className="text-sm">Notify on completion</Label>
                </div>
              </div>
            </div>
            {/* Cascade Process Explanation */}
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">How Cascading Works</h4>
              <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                <p><strong>Required Cascading:</strong> Your Tier 1 suppliers must distribute this assessment to their selected lower tier suppliers as a compliance requirement.</p>
                <p><strong>Optional Cascading:</strong> Tier 1 suppliers can choose to cascade the assessment to lower tiers at their discretion.</p>
                <p><strong>Material/Product Specific:</strong> Only suppliers directly involved in production or sourcing of specific materials will receive the assessment.</p>
                <p><strong>Risk-based Selection:</strong> The system automatically identifies high-risk suppliers based on geographic location, processes, and previous assessment scores.</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button variant="ghost">Save as Draft</Button>
            <div className="flex space-x-4">
              <Link href="/traceability/request">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isLoadingAssessments || !assessments || assessments.filter(a => a.status === 'Complete').length === 0}
                className="bg-brand-primary hover:bg-brand-primary/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {isCreating ? 'Creating...' :
                  isLoadingAssessments ? 'Loading...' :
                    !assessments || assessments.filter(a => a.status === 'Complete').length === 0 ? 'No Assessments Available' :
                      'Send Request'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 