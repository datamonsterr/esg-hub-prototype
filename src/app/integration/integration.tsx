"use client"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Product } from "@/src/types"
import { DataIntegrationsData, IntegrationMethod, PopularIntegration } from '@/src/types/integration'
import { Database, Search, Upload, Webhook } from "lucide-react"
import { useState } from "react"

export function DataIntegrations({ selectedProduct, onProductSelect, onStartUpload }: {
  selectedProduct: Product | null,
  onProductSelect: () => void,
  onStartUpload: () => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  
  const dataIntegrations : DataIntegrationsData = {
    integrationMethods: [
      {
        title: "Database",
        description: "Connect to your database for real-time data sync.",
        icon: "Database",
        tags: ["SQL", "NoSQL"],
        action: "Connect",
        onClick: 'onNavigateToUpload'
      },
      {
        title: "File Upload",
        description: "Upload files directly to the platform.",
        icon: "Upload",
        tags: ["CSV", "Excel"],
        action: "Upload File",
        onClick: 'onNavigateToUpload'
      },
      {
        title: "API & Webhooks",
        description: "Integrate with external APIs and set up webhooks.",
        icon: "Webhook",
        tags: ["REST", "GraphQL"],
        action: "Setup API",
        onClick: 'onNavigateToUpload'
      }
    ],
    popularIntegrations: [
      {
        "icon": "📊",
        "name": "Excel Online",
        "description": "Connect to your spreadsheets in the cloud.",
        "color": "bg-green-100"
      },
      {
        "icon": "📦",
        "name": "SAP S/4HANA",
        "description": "Integrate with your enterprise resource planning.",
        "color": "bg-blue-100"
      },
      {
        "icon": "🔗",
        "name": "Salesforce",
        "description": "Sync your supplier and product data.",
        "color": "bg-sky-100"
      },
      {
        "icon": "📄",
        "name": "Google Sheets",
        "description": "Pull data directly from your shared sheets.",
        "color": "bg-yellow-100"
      }
    ]
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Database':
        return Database;
      case 'Upload':
        return Upload;
      case 'Webhook':
        return Webhook;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        {/* Search and Filter Section */}
        <div className={`flex flex-col sm:flex-row gap-4 ${!selectedProduct ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search integration options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border-light rounded-brand h-12 text-base"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-64 border-border-light rounded-brand h-12">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="database">Database</SelectItem>
              <SelectItem value="file">File Upload</SelectItem>
              <SelectItem value="api">API & Webhooks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Integration Methods */}
        <div className={!selectedProduct ? "opacity-50 pointer-events-none" : ""}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dataIntegrations.integrationMethods.map((method: IntegrationMethod, index: number) => {
              const Icon = getIcon(method.icon);
              return (
                <Card
                  key={index}
                  className="border-border-light rounded-brand hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 flex flex-col h-full"
                >
                  <CardHeader className="pb-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 rounded-2xl">
                        {Icon && <Icon className="h-8 w-8 text-brand-primary" />}
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{method.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 px-6 flex-grow">
                    <CardDescription className="text-gray-600 text-center leading-relaxed min-h-[3rem] flex items-center justify-center">
                      {method.description}
                    </CardDescription>
                    <div className="flex flex-wrap justify-center gap-2 min-h-[2.5rem] items-center">
                      {method.tags.map((tag: string, tagIndex: number) => (
                        <Badge 
                          key={tagIndex} 
                          variant="secondary" 
                          className="bg-brand-secondary/50 text-gray-700 px-3 py-1 text-sm font-medium"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 px-6 pb-6 mt-auto">
                    <Button
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 rounded-brand h-12 text-base font-medium transition-all duration-200"
                      onClick={method.onClick === 'onNavigateToUpload' && selectedProduct ? onStartUpload : undefined}
                    >
                      {method.action} →
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Popular Integrations */}
        <div className={!selectedProduct ? "opacity-50 pointer-events-none" : ""}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Popular Integrations</h2>
            <p className="text-gray-600">Connect with your favorite tools and platforms</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataIntegrations.popularIntegrations.map((integration: PopularIntegration, index: number) => (
              <Card
                key={index}
                className="border-border-light rounded-brand hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 ${integration.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <span className="text-2xl font-bold">{integration.icon}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{integration.name}</h3>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">{integration.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-border-light rounded-brand bg-transparent hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-200 w-full"
                  >
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
