"use client"

import { useState } from "react"
import { Download, Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { useTraceabilityAnalytics } from "@/src/api/traceability"

export default function TraceabilityAnalyticsPage() {
  const { analytics, isLoading, isError } = useTraceabilityAnalytics()
  const [activeTab, setActiveTab] = useState("manual")
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [aiQuery, setAiQuery] = useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600">There was an error loading the analytics data. Please try again later.</p>
      </div>
    )
  }

  const addDimension = (dimension: string) => {
    if (dimension && !selectedDimensions.includes(dimension)) {
      setSelectedDimensions(prev => [...prev, dimension])
    }
  }

  const addMetric = (metric: string) => {
    if (metric && !selectedMetrics.includes(metric)) {
      setSelectedMetrics(prev => [...prev, metric])
    }
  }

  const removeDimension = (dimension: string) => {
    setSelectedDimensions(prev => prev.filter(d => d !== dimension))
  }

  const removeMetric = (metric: string) => {
    setSelectedMetrics(prev => prev.filter(m => m !== metric))
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Traceability Analytics</h1>
          <p className="text-gray-600">Analyze traceability data across your supply chain with advanced query capabilities</p>
        </div>
        <Button variant="outline" className="text-brand-primary border-brand-primary hover:bg-brand-primary/5">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Query Builder Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Query Builder</TabsTrigger>
                <TabsTrigger value="ai">Use AI</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4 mt-4">
                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                  <Select onValueChange={addDimension}>
                    <SelectTrigger className="text-sm mb-2">
                      <SelectValue placeholder="Select dimension..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="country_origin">Country of Origin</SelectItem>
                      <SelectItem value="material_type">Material Type</SelectItem>
                      <SelectItem value="product_category">Product Category</SelectItem>
                      <SelectItem value="supplier_tier">Supplier Tier</SelectItem>
                      <SelectItem value="region">Region</SelectItem>
                      <SelectItem value="assessment_id">Assessment ID</SelectItem>
                      <SelectItem value="request_id">Request ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="min-h-[60px] space-y-1 p-2 border border-gray-200 rounded-md bg-gray-50">
                    {selectedDimensions.map((dimension) => (
                      <Badge 
                        key={dimension} 
                        variant="secondary" 
                        className="bg-brand-primary/10 text-brand-primary text-xs mr-1 mb-1"
                      >
                        {dimension}
                        <button 
                          className="ml-1 text-brand-primary/70 hover:text-brand-primary"
                          onClick={() => removeDimension(dimension)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Metrics</label>
                  <Select onValueChange={addMetric}>
                    <SelectTrigger className="text-sm mb-2">
                      <SelectValue placeholder="Select metric..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="origin_percentage">% of Origin Traced</SelectItem>
                      <SelectItem value="tariff_risk">Tariff Policy Risk</SelectItem>
                      <SelectItem value="material_traceability">Material Traceability %</SelectItem>
                      <SelectItem value="compliance_score">Compliance Score</SelectItem>
                      <SelectItem value="supply_chain_visibility">Supply Chain Visibility</SelectItem>
                      <SelectItem value="risk_score">Overall Risk Score</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="min-h-[60px] space-y-1 p-2 border border-gray-200 rounded-md bg-gray-50">
                    {selectedMetrics.map((metric) => (
                      <Badge 
                        key={metric} 
                        variant="secondary" 
                        className="bg-yellow-100 text-yellow-700 text-xs mr-1 mb-1"
                      >
                        {metric}
                        <button 
                          className="ml-1 text-yellow-700/70 hover:text-yellow-700"
                          onClick={() => removeMetric(metric)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filters</label>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                      <div className="flex space-x-2 mb-2">
                        <Select>
                          <SelectTrigger className="flex-1 text-sm">
                            <SelectValue placeholder="Dimension..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="country_origin">Country of Origin</SelectItem>
                            <SelectItem value="material_type">Material Type</SelectItem>
                            <SelectItem value="product_category">Product Category</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="=" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="greater_than">&gt;</SelectItem>
                            <SelectItem value="less_than">&lt;</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input placeholder="Filter value..." className="text-sm" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="bg-brand-primary/10 text-brand-primary text-xs">
                        + AND
                      </Button>
                      <Button size="sm" variant="outline" className="bg-yellow-100 text-yellow-700 text-xs">
                        + OR
                      </Button>
                    </div>
                    <Select>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Last 12 months" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12months">Last 12 months</SelectItem>
                        <SelectItem value="6months">Last 6 months</SelectItem>
                        <SelectItem value="3months">Last 3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full bg-brand-primary hover:bg-brand-primary/90 text-sm">
                  Apply Query
                </Button>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AI Assistant</label>
                  <Textarea
                    placeholder="Ask me about traceability data... e.g., 'Show me tariff risk levels for footwear products from Vietnam'"
                    className="text-sm h-32 resize-none"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                </div>
                <Button className="w-full bg-yellow-500 text-white hover:bg-yellow-600 text-sm">
                  Query
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Key Insights */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h2>
            <div className="prose text-sm text-gray-700 leading-relaxed">
              <p>{analytics?.keyInsights}</p>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tariff Risk Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">Tariff Risk by Country</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">Chart Placeholder</div>
                  <div className="text-xs text-gray-500">
                    Tariff risk visualization for {analytics?.tariffRiskByCountry?.length || 0} countries
                  </div>
                </div>
              </div>
            </div>

            {/* Origin Traceability Trends */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">Origin Traceability Trends</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">Chart Placeholder</div>
                  <div className="text-xs text-gray-500">
                    Trend analysis over {analytics?.originTraceabilityTrends?.length || 0} periods
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">Traceability Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Traceability</span>
                  <span className="text-sm font-medium text-brand-primary">
                    {analytics?.overallStats?.traceabilityPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-brand-primary h-2 rounded-full" 
                    style={{ width: `${analytics?.overallStats?.traceabilityPercentage || 0}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-medium text-brand-primary">
                      {analytics?.overallStats?.tracedCount || 0}
                    </div>
                    <div className="text-xs text-gray-600">Traced</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-medium text-red-500">
                      {analytics?.overallStats?.untracedCount || 0}
                    </div>
                    <div className="text-xs text-gray-600">Untraced</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Material Traceability */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-base font-medium text-gray-900 mb-4">Material Traceability</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">Chart Placeholder</div>
                  <div className="text-xs text-gray-500">
                    Material breakdown for {analytics?.materialTraceability?.length || 0} materials
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Results Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Detailed Results</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Country</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Tariff Risk</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Origin %</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Material</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analytics?.tariffRiskByCountry?.map((country, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4 text-sm">{country.country}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`font-medium ${
                          country.riskLevel === 'High' ? 'text-red-600' :
                          country.riskLevel === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {country.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{country.originPercentage}%</td>
                      <td className="py-3 px-4 text-sm">{country.material}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge 
                          className={`text-xs ${
                            country.status === 'At Risk' ? 'bg-red-100 text-red-700' :
                            country.status === 'Monitoring' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}
                        >
                          {country.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 