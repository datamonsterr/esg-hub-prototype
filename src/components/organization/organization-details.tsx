'use client';

import { useAuth } from "@clerk/nextjs";
import { Organization } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { api } from "@/src/utils/api";

export function OrganizationDetails() {
    const { orgId } = useAuth();
    
    // In a real scenario, orgId would come from the user's session/token after accepting invitation.
    // For this prototype, we'll check it if it doesn't exist.
    const effectiveOrgId = orgId || 'org-001';

    const { data: organization, isLoading, error } = api.organization.getOrganizationById.useQuery(
        { id: effectiveOrgId || '' },
        {
            enabled: !!effectiveOrgId,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        }
    );

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </CardContent>
            </Card>
        );
    }

    if (error || !organization) {
        return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>Could not load organization details.</p></CardContent></Card>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{organization.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p><strong>Type:</strong> {organization.type}</p>
                <p><strong>Email:</strong> {organization.contactEmail}</p>
                <p><strong>Address:</strong> {organization.address}</p>
            </CardContent>
        </Card>
    );
}