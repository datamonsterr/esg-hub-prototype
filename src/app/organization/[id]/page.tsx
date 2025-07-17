"use client";

import { OrganizationDetails } from "@/src/components/organization/organization-details";

export default function OrganizationPage({ params }: { params: { id: string } }) {

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Organization</h1>
            <OrganizationDetails />
        </div>
    );
}
