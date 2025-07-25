"use client";

import { usePathname } from "next/navigation";
import { OrganizationGuard } from "./organization-guard";

interface ConditionalOrganizationGuardProps {
    children: React.ReactNode;
}

export function ConditionalOrganizationGuard({ children }: ConditionalOrganizationGuardProps) {
    const pathname = usePathname();

    // Pages that don't require organization
    const publicPaths = [
        '/sign-in',
        '/sign-up',
        '/onboarding',
        '/admin', // Admin page has its own organization check
        '/traceability' // Remove organization requirement for traceability module
    ];

    const requiresOrganization = !publicPaths.some(path => pathname.startsWith(path));

    if (!requiresOrganization) {
        return <>{children}</>;
    }

    return (
        <OrganizationGuard requiresOrganization={true}>
            {children}
        </OrganizationGuard>
    );
}
