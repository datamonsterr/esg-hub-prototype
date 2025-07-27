import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ModalProvider } from '@/src/context/modal/modal-provider';
import { Navbar } from '@/src/components/navbar';
import GlobalBreadcrumb from '@/src/app/_GlobalBreadcrumb';
import { Toaster } from '@/src/components/ui/sonner';
import { ConditionalOrganizationGuard } from '@/src/components/conditional-organization-guard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Traceability Hub',
  description: 'Traceability Hub - from Nuoa.io',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </head>
        <body className={inter.className}>
          <ModalProvider>
              <Navbar />
              <GlobalBreadcrumb />
              <main className="h-full max-w-[1200px] mx-auto px-4">
                {children}
              </main>
            <Toaster />
          </ModalProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
