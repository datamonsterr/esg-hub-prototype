"use client"

import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Navbar } from "../components/navbar"
import { ModalProvider } from "@/src/context/modal/modal-provider"

// Client wrapper for breadcrumb
import dynamic from "next/dynamic"

const GlobalBreadcrumb = dynamic(() => import("./_GlobalBreadcrumb"), { ssr: false })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ModalProvider>
            <Navbar />
            <GlobalBreadcrumb />
            <div className="max-w-[1200px] mx-auto px-4">{children}</div>
          </ModalProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
