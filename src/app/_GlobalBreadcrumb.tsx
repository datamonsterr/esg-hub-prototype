"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb } from "@/src/components/breadcrumb"

const labelMap: Record<string, string> = {
  "data-integration": "Data Integrations",
  "file-upload": "File Upload",
  "validation": "Data Validation",
  "data-management": "Data Management",
  "traceability-request": "Traceability Request",
  "supplier-traceability": "Traceability Requests",
  "traceability": "Traceability",
  "request": "Request",
  "create": "Create",
  "analytics": "Analytics",
  "assessment": "Assessment",
  "reports": "Reports",
  "supplier-assessment": "Supplier Assessment",
}

const isDynamicId = (segment: string) => {
  // Checks if the segment is a number or a long alphanumeric string (like a CUID or UUID)
  return /^\d+$/.test(segment) || (segment.length > 10 && /[a-zA-Z]/.test(segment) && /\d/.test(segment));
};

export default function GlobalBreadcrumb() {
  const pathname = usePathname()

  // Split pathname into segments, filter empty
  const segments = pathname.split("/").filter(Boolean)

  const items: { label: string; href?: string }[] = [{ label: "Home", href: "/" }]

  let cumulativePath = ""
  segments.forEach((segment) => {
    cumulativePath += `/${segment}`
    if (isDynamicId(segment)) return; // Skip dynamic IDs

    const label = labelMap[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    items.push({ label, href: cumulativePath })
  })

  // Set the last item's href to undefined
  if (items.length > 1) {
    items[items.length - 1].href = undefined;
  }

  // Hide breadcrumb on root path
  if (items.length <= 1) return null

  return (
    <div className="max-w-[1200px] mx-auto px-4 pt-4">
      <Breadcrumb items={items} />
    </div>
  )
} 