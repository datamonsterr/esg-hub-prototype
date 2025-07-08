'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from './ui';

const navItems = [
  { href: '/data-integrations', label: 'Data Integrations' },
  { href: '/esg-actions', label: 'ESG Actions' },
  { href: '/data-management', label: 'Data Management' },
  { href: '/report', label: 'Reports' }
];

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <header className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Left group: Logo + Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
              <span className="text-sm">🌿</span>
            </div>
            <span className="text-xl font-medium text-gray-900">ESG Hub</span>
          </Link>

          <nav className="hidden md:flex space-x-6 h-16 items-center">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? 'text-primary font-medium border-b-2 border-primary h-full flex items-center'
                      : 'text-gray-600 hover:text-primary h-full flex items-center'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right group: Notification + User */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" aria-label="Notifications">
            <span className="text-xl">🔔</span>
          </Button>

          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}; 