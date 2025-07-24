"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Building2, UserPlus } from "lucide-react";
import { useGetUserOrg } from "@/src/api/user";
import axiosInstance from "@/src/api/axios";

interface OrganizationGuardProps {
    children: React.ReactNode;
    requiresOrganization?: boolean;
}

export function OrganizationGuard({
    children,
    requiresOrganization = true
}: OrganizationGuardProps) {
    const { user, isLoaded } = useUser();
    const { organization, isLoading: isOrgLoading } = useGetUserOrg();
    const router = useRouter();
    const [isCheckingOrg, setIsCheckingOrg] = useState(true);

    useEffect(() => {
        const handleAutoAssignment = async () => {
            if (isLoaded && !isOrgLoading) {
                const userOrgId = user?.unsafeMetadata?.organizationId as string;
                const userEmail = user?.emailAddresses?.[0]?.emailAddress;

                console.log("Organization Guard - User email:", userEmail);
                console.log("Organization Guard - User org ID:", userOrgId);

                // Auto-assign dat.pham@nuoa.io as admin of Nuoa organization
                if (userEmail === "dat.pham@nuoa.io" && !userOrgId) {
                    console.log("Auto-assigning admin access for dat.pham@nuoa.io");
                    try {
                        // First sync to our database
                        await axiosInstance.post('/users/sync', {
                            email: userEmail,
                            organizationId: "org-nuoa",
                            organizationRole: "admin",
                            userData: {
                                firstName: user?.firstName,
                                lastName: user?.lastName,
                                fullName: user?.fullName,
                                imageUrl: user?.imageUrl
                            }
                        });

                        // Then update Clerk metadata
                        await user?.update({
                            unsafeMetadata: {
                                ...user.unsafeMetadata,
                                organizationId: "org-nuoa",
                                organizationRole: "admin"
                            }
                        });

                        console.log("Auto-assignment successful, reloading page");
                        // Refresh the page to reflect the changes
                        window.location.reload();
                        return;
                    } catch (error) {
                        console.error("Error auto-assigning admin:", error);
                    }
                }

                if (requiresOrganization && !userOrgId) {
                    setIsCheckingOrg(false);
                } else {
                    setIsCheckingOrg(false);
                }
            }
        };

        handleAutoAssignment();
    }, [isLoaded, isOrgLoading, user, organization, requiresOrganization]);

    // Show loading while checking
    if (!isLoaded || isOrgLoading || isCheckingOrg) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // If organization is required but user doesn't have one
    const userOrgId = user?.unsafeMetadata?.organizationId as string;
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    // Show special auto-assignment message for dat.pham@nuoa.io during processing
    if (requiresOrganization && !userOrgId && userEmail === "dat.pham@nuoa.io") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Card className="w-full max-w-md border-0 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <Building2 className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Setting up your admin account
                            </h3>
                            <div className="flex justify-center mb-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                            </div>
                            <p className="text-sm text-gray-600">
                                Configuring your access to Nuoa.io organization...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (requiresOrganization && !userOrgId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <Building2 className="h-8 w-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-xl">Organization Required</CardTitle>
                        <CardDescription>
                            You must be part of an organization to access this application
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>What to do next:</strong>
                            </p>
                            <ul className="mt-2 list-disc list-inside text-sm text-blue-700 space-y-1">
                                <li>Check your email for pending invitations</li>
                                <li>Contact your organization administrator</li>
                                <li>Request an invitation to join your organization</li>
                            </ul>
                            <div className="mt-3 text-xs text-blue-600">
                                <strong>Note:</strong> Most @gmail.com and common email addresses are automatically invited to Nuoa.io for demo purposes.
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                onClick={() => router.push("/onboarding")}
                                className="w-full"
                                variant="default"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Check Pending Invitations
                            </Button>

                            <Button
                                onClick={() => router.push("/sign-in")}
                                variant="outline"
                                className="w-full"
                            >
                                Sign Out
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Need help? Contact support at{" "}
                                <a href="mailto:support@esg-hub.com" className="text-blue-600 hover:underline">
                                    support@esg-hub.com
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User has organization or organization is not required
    return <>{children}</>;
}
