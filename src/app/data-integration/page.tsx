"use client"

import { useRouter } from "next/navigation"
import { DataIntegrations } from "@/src/app/data-integration/data-integrations"

export default function DataIntegrationPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-white">
      <main className="px-20 py-8">
        <DataIntegrations onNavigateToUpload={() => router.push("/data-integration/file-upload")} />
      </main>
    </div>
  )
} 