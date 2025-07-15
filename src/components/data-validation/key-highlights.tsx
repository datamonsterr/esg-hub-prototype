"use client"

import { useState } from "react"
import { useGetKeyHighlights } from "@/src/api/integration"
import { Button } from "@/src/components/ui/button"
import { Progress } from "@/src/components/ui/progress"
import { Highlight } from "@/src/types/data-integration"
import { CheckCircle, AlertCircle } from "lucide-react"

interface KeyHighlightsProps {
  contentUrl: string | undefined
}

export function KeyHighlights({ contentUrl }: KeyHighlightsProps) {
  const {
    keyHighlights,
    isLoading,
    isError,
  } = useGetKeyHighlights(contentUrl)
  const [showHighlightPrompt, setShowHighlightPrompt] = useState(false)

  if (isLoading) return <div>Loading key highlights...</div>
  if (isError) return <div>Error loading key highlights.</div>
  if (!keyHighlights) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

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
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHighlightPrompt(!showHighlightPrompt)}
        className="absolute top-[-48px] right-0 border-border-light rounded-brand bg-transparent"
      >
        Edit Prompt
      </Button>
      {showHighlightPrompt && (
        <div className="absolute right-0 top-[-8px] z-20 w-72 bg-white border border-border-light rounded-brand shadow-lg p-4 space-y-2">
          <h3 className="font-medium text-sm">Edit Prompt</h3>
          <textarea
            className="w-full h-24 border border-border-light rounded p-2 text-sm"
            placeholder="Enter prompt..."
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHighlightPrompt(false)}
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
        {keyHighlights.highlights.map(
          (highlight: Highlight, index: number) => (
            <div
              key={index}
              className={`border border-border-light rounded-brand p-4 ${getHighlightBackground(
                highlight.status,
              )}`}
            >
              <div className="flex items-start space-x-2 mb-2">
                {getStatusIcon(highlight.status)}
                <span className="font-medium">{highlight.percentage}%</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {highlight.title}
              </p>
              <p className="text-xs text-gray-500">{highlight.detail}</p>
              <Progress value={highlight.percentage} className="mt-2" />
            </div>
          ),
        )}
        <div className="flex space-x-2 mt-4">
          <Button className="bg-brand-primary hover:bg-brand-primary/90 rounded-brand">
            Re-extract Data
          </Button>
          <Button
            variant="outline"
            className="border-border-light rounded-brand bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
} 