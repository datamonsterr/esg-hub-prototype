"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Building2, CheckCircle, Clock, Mail } from "lucide-react";
import { acceptInvitation } from "@/src/api/onboarding";
import { PendingInvitation } from "@/src/types/user";
import { useToast } from "@/src/hooks/use-toast";

export default function OnboardingPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const { showSuccessToast, showErrorToast } = useToast();

    const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            // Check if user already has organization assignment
            const userOrgId = user.unsafeMetadata?.organizationId as string;
            const userEmail = user.emailAddresses?.[0]?.emailAddress;

            if (userOrgId) {
                // User is already assigned to an organization, redirect to home
                router.push('/');
                return;
            }

            // Auto-redirect admin user
            if (userEmail === "dat.pham@nuoa.io") {
                router.push('/');
                return;
            }

            if (user.emailAddresses?.[0]?.emailAddress) {
                loadInvitations();
            }
        }
    }, [isLoaded, user, router]);

    const loadInvitations = async () => {
        try {
            setIsLoading(true);

            // Auto-create invitation for new users
            if (user?.emailAddresses?.[0]?.emailAddress) {
                const email = user.emailAddresses[0].emailAddress;
                const firstName = user.firstName || "";
                const lastName = user.lastName || "";

                // Auto-create invitation
                await fetch("/api/onboard/pending-invitations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, firstName, lastName }),
                });
            }

            const email = user?.emailAddresses?.[0]?.emailAddress;
            const response = await fetch(`/api/onboard/pending-invitations?email=${email}`);
            const data = await response.json();

            if (response.ok) {
                setInvitations(data);
            } else {
                console.error("Failed to load invitations:", data.error);
            }
        } catch (error) {
            console.error("Error loading invitations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptInvitation = async (invitationId: string) => {
        try {
            setAcceptingId(invitationId);

            const result = await acceptInvitation(invitationId);

            showSuccessToast(`Successfully joined ${result.organizationName || "organization"}!`);

            // Redirect to main app
            router.push("/");
        } catch (error) {
            console.error("Error accepting invitation:", error);
            showErrorToast("Failed to accept invitation. Please try again.");
        } finally {
            setAcceptingId(null);
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        router.push("/sign-in");
        return null;
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="text-center mb-8">
                <Building2 className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Welcome to ESG Hub</h1>
                <p className="text-gray-600">
                    Hi {user.firstName || user.emailAddresses?.[0]?.emailAddress}!
                    Let's get you set up with an organization.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : invitations.length > 0 ? (
                <div className="space-y-6">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-semibold mb-2">Pending Invitations</h2>
                        <p className="text-gray-600">
                            You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
                            to join an organization.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {invitations.map((invitation) => (
                            <Card key={invitation.id} className="relative">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-8 w-8 text-blue-600" />
                                            <div>
                                                <CardTitle className="text-xl">
                                                    {invitation.organizationName}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Mail className="h-4 w-4" />
                                                    Invited by {invitation.invitedBy.name} ({invitation.invitedBy.email})
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {invitation.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Role:</span>
                                                <p className="capitalize">{invitation.organizationRole}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Invited:</span>
                                                <p>{new Date(invitation.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium">Expires:</span>
                                                <p>{new Date(invitation.expiresAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => handleAcceptInvitation(invitation.id)}
                                                disabled={acceptingId === invitation.id}
                                                className="flex items-center gap-2"
                                            >
                                                {acceptingId === invitation.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        Accepting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4" />
                                                        Accept Invitation
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline">
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : (
                <Card>
                    <CardContent className="text-center py-12">
                        <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No Invitations Found</h2>
                        <p className="text-gray-600 mb-6">
                            You don't have any pending invitations at this time.
                            Please contact your organization administrator to request an invitation.
                        </p>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">
                                <strong>Need help?</strong>
                            </p>
                            <p className="text-sm text-gray-500">
                                Contact support at{" "}
                                <a href="mailto:support@esg-hub.com" className="text-blue-600 hover:underline">
                                    support@esg-hub.com
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 