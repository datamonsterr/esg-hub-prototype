"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { useModal } from "../context/modal/modal-context"
import { useEffect } from "react"
import { RoleSelectionModalContent } from "./role-selection-modal-content"
import { UserAccountNav } from "./user-account-nav"

export function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { showModal } = useModal();

  useEffect(() => {
    if (user && !user.unsafeMetadata.userRole) {
      showModal(<RoleSelectionModalContent />);
    }
  }, [user, showModal]);

  const userRole = user?.unsafeMetadata.userRole as "supplier" | "brand";

  const supplierNavItems = [
    { href: "/data-integration", label: "Data Integrations", match: "/data-integration" },
    { href: "/data-management", label: "Data Management", match: "/data-management" },
    { href: "/traceability-request", label: "Traceability Request", match: "/traceability-request" },
    { href: "/reports", label: "Reports", match: "/reports" },
  ];

  const brandNavItems = [
    { href: "/data-integration", label: "Data Integration", match: "/data-integration" },
    {
      label: "Traceability",
      match: "/traceability",
      subItems: [
        { href: "/traceability/request", label: "Request", match: "/traceability/request" },
        { href: "/traceability/analytics", label: "Analytics", match: "/traceability/analytics" },
      ],
    },
    { href: "/supplier-assessment", label: "Supplier Assessment", match: "/supplier-assessment" },
  ];

  const navItems = userRole === 'brand' ? brandNavItems : supplierNavItems;


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
                if ('subItems' in item && item.subItems) {
                    // Handle dropdown for brand's Traceability
                    return (
                        <div key={item.label} className="relative group">
                            <span className={linkClasses(pathname.startsWith(item.match))}>
                                {item.label}
                            </span>
                            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-2 w-48">
                                {item.subItems.map(subItem => (
                                    <Link key={subItem.href} href={subItem.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        {subItem.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }
                if ('href' in item) {
                    const active = pathname.startsWith(item.match)
                    return (
                        <Link key={item.href} href={item.href} className={linkClasses(active)}>
                        {item.label}
                        </Link>
                    )
                }
                return null
            })}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <UserAccountNav />
        </div>
      </div>
    </nav>
  )
}
