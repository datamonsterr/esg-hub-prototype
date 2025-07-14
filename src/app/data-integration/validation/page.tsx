"use client"

import { useRouter } from "next/navigation"
import { DataValidation } from "@/src/app/data-integration/validation/data-validation"

export default function ValidationPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-white">
      <main className="px-20 py-8">
        <DataValidation onNavigateBack={() => router.push("/data-integration/file-upload")} />
      </main>
    </div>
  )
} 