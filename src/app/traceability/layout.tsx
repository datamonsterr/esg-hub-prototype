"use client"

import type { ReactNode } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TraceabilityLayout({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      const organizationId = user.unsafeMetadata.organizationId as string

      // Check if user belongs to an organization
      if (!organizationId) {
        router.replace("/onboarding")
        return
      }
    }
  }, [isLoaded, user, router])

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    router.replace("/sign-in")
    return null
  }

  const organizationId = user.unsafeMetadata.organizationId as string

  // Redirect if not part of an organization
  if (!organizationId) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Organization Required</h2>
          <p className="text-gray-600">You need to be part of an organization to access this feature.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 