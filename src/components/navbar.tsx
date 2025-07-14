"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, User } from "lucide-react"
import { Button } from "@/src/components/ui/button"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/data-integration", label: "Data Integrations", match: "/data-integration" },
    { href: "/data-management", label: "Data Management", match: "/data-management" },
    { href: "/traceability-request", label: "Traceability Request", match: "/traceability-request" },
    { href: "/reports", label: "Reports", match: "/reports" },
  ]

  const linkClasses = (active: boolean) =>
    [
      "pb-2 transition-colors",
      active
        ? "text-brand-primary border-b-2 border-brand-primary font-medium"
        : "text-gray-600 hover:text-gray-900",
    ].join(" ")

  return (
    <nav className="bg-white border-b border-border-light">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-primary rounded flex items-center justify-center">
              <span className="text-white text-sm font-medium">✓</span>
            </div>
            <span className="font-medium text-lg">Traceability Hub</span>
          </div>

          <div className="flex space-x-6">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.match)
              return (
                <Link key={item.href} href={item.href} className={linkClasses(active)}>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
