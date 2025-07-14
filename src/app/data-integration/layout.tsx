"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function DataIntegrationLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        {/* Title & Description */}
        <div>
          <h1 className="text-2xl font-semibold">Data Integration</h1>
          <p className="text-gray-600 text-sm">Connect, upload, and manage your ESG data sources</p>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-brand px-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {children}
    </div>
  )
} 