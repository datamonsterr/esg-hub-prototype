"use client"

import { useRouter } from "next/navigation"
import { FileUpload } from "@/src/app/data-integration/file-upload/file-upload"

export default function FileUploadPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-white">
      <main className="px-20 py-8">
        <FileUpload
          onNavigateBack={() => router.push("/data-integration")}
          onNavigateToValidation={() => router.push("/data-integration/validation")}
        />
      </main>
    </div>
  )
} 