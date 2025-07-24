"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Settings } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { UserAccountNav } from "./user-account-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useGetNotifications } from "../api/notification"
import { formatDistanceToNow } from 'date-fns';

export function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { notifications } = useGetNotifications();

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.organizationRole === "admin";

  const navItems = [
    { href: "/management", label: "Management", match: "/management" },
    { href: "/integration", label: "Integration", match: "/integration" },
    {
      label: "Traceability",
      match: "/traceability",
      subItems: [
        { href: "/traceability/incoming", label: "Incoming Requests", match: "/traceability/incoming" },
        { href: "/traceability/outgoing", label: "Outgoing Requests", match: "/traceability/outgoing" },
        { href: "/traceability/analytics", label: "Analytics", match: "/traceability/analytics" },
      ],
    },
    { href: "/assessment", label: "Assessment", match: "/assessment" },
  ];

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
                // Handle dropdown for Traceability
                return (
                  <div key={item.label} className="relative group">
                    <span className={linkClasses(pathname.startsWith(item.match))}>
                      {item.label}
                    </span>
                    <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 py-2 w-48 z-50">
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
          {/* Admin Button for admin users */}
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications && notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} asChild>
                    <Link href={notification.actionUrl || '#'} className="flex items-start p-2 space-x-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 self-center" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <UserAccountNav />
        </div>
      </div>
    </nav>
  )
}
