import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from '@/components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`antialiased bg-background font-arial`}>
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}