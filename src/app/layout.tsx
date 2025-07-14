"use client"

import "./globals.css"
import { Navbar } from "../components/navbar"

// Client wrapper for breadcrumb
import dynamic from "next/dynamic"

const GlobalBreadcrumb = dynamic(() => import("./_GlobalBreadcrumb"), { ssr: false })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <GlobalBreadcrumb />
        <div className="max-w-[1200px] mx-auto px-4">{children}</div>
      </body>
    </html>
  )
}
