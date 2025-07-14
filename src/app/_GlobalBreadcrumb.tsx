"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb } from "@/src/components/breadcrumb"

const labelMap: Record<string, string> = {
  "data-integration": "Data Integrations",
  "file-upload": "File Upload",
  "validation": "Data Validation",
  "data-management": "Data Management",
  "traceability-request": "Traceability Request",
  "reports": "Reports",
}

export default function GlobalBreadcrumb() {
  const pathname = usePathname()

  // Split pathname into segments, filter empty
  const segments = pathname.split("/").filter(Boolean)

  const items: { label: string; href?: string }[] = [{ label: "Home", href: "/" }]

  let cumulativePath = ""
  segments.forEach((segment, index) => {
    cumulativePath += `/${segment}`
    const isLast = index === segments.length - 1
    const label = labelMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    items.push({ label, href: isLast ? undefined : cumulativePath })
  })

  // Hide breadcrumb on root path
  if (items.length <= 1) return null

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-4">
      <Breadcrumb items={items} />
    </div>
  )
} 