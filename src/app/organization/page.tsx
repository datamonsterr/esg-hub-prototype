"use client";

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrganizationRootPage() {
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        const organizationId = user?.unsafeMetadata?.organizationId as string;
        if (organizationId) {
            router.replace(`/organization/${organizationId}`);
        }
    }, [user, router]);

    return (
        <div>
            <p>Loading organization...</p>
        </div>
    );
}
