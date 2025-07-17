'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SupplierTraceabilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user belongs to an organization
      const organizationId = user.unsafeMetadata?.organizationId;
      
      if (!organizationId) {
        // Redirect users without organization to onboarding
        router.push('/onboarding');
        return;
      }
    }
  }, [isLoaded, user, router]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render content if user is not part of an organization
  if (user && !user.unsafeMetadata?.organizationId) {
    return null;
  }

  return <div>{children}</div>;
} 