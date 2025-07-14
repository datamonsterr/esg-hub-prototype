"use client"

import { useState } from "react"
import { Search, Database, Upload, Webhook, CheckCircle, Clock, XCircle, Eye } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { useDataIntegrations } from '@/src/api/data-integration';
import { GlobalLoading } from '@/src/components/global-loading';
import { IntegrationMethod, PopularIntegration, RecentActivity } from '@/src/types/data-integration';
import { ErrorComponent } from '@/src/components/ui/error';

interface DataIntegrationsProps {
  onNavigateToUpload: () => void
}

export function DataIntegrations({ onNavigateToUpload }: DataIntegrationsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { dataIntegrations, isLoading, isError } = useDataIntegrations();

  if (isLoading) {
    return <GlobalLoading />;
  }

  if (isError) {
    return <ErrorComponent title="Error Loading Data" description="There was an error loading the data integrations. Please try again later." />;
  }

  if (!dataIntegrations) {
    return null;
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      default:
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search integration options..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-border-light rounded-brand"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 border-border-light rounded-brand">
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
      <div>
        <h2 className="text-xl font-medium mb-6">Choose Your Integration Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dataIntegrations.integrationMethods.map((method: IntegrationMethod, index: number) => {
            const Icon = getIcon(method.icon);
            return (
              <Card
                key={index}
                className="border-border-light rounded-brand hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-brand-primary/10 rounded-brand">
                      {Icon && <Icon className="h-6 w-6 text-brand-primary" />}
                    </div>
                    <CardTitle className="text-lg font-medium">{method.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-600">{method.description}</CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {method.tags.map((tag: string, tagIndex: number) => (
                      <Badge key={tagIndex} variant="secondary" className="bg-brand-secondary/50 text-gray-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    className="w-full bg-brand-primary hover:bg-brand-primary/90 rounded-brand"
                    onClick={method.onClick === 'onNavigateToUpload' ? onNavigateToUpload : undefined}
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
      <div>
        <h2 className="text-xl font-medium mb-6">Popular Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dataIntegrations.popularIntegrations.map((integration: PopularIntegration, index: number) => (
            <Card
              key={index}
              className="border-border-light rounded-brand hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-12 h-12 ${integration.color} rounded-brand flex items-center justify-center mx-auto mb-3`}
                >
                  <span className="text-2xl">{integration.icon}</span>
                </div>
                <h3 className="font-medium mb-1">{integration.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                <Button variant="outline" size="sm" className="border-border-light rounded-brand bg-transparent">
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Integration Activity */}
      <Card className="border-border-light rounded-brand">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-medium">Recent Integration Activity</CardTitle>
          <Button variant="outline" size="sm" className="border-border-light rounded-brand bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            View All Activities
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataIntegrations.recentActivities.map((activity: RecentActivity, index: number) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-brand">
              {getStatusIcon(activity.status)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                <p className="text-sm text-gray-600">{activity.subtitle}</p>
              </div>
              {getStatusBadge(activity.status)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
