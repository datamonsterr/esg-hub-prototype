"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUserContext } from '@/src/hooks/useUserContext';

export default function OrganizationRootPage() {
    const { organizationId, isLoading } = useUserContext();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && organizationId) {
            router.replace(`/organization/${organizationId}`);
        }
    }, [organizationId, isLoading, router]);

    return (
        <div>
            <p>Loading organization...</p>
        </div>
    );
}
