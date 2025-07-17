"use client";

import { useGetPendingInvitations, useAcceptInvitation } from "@/src/api/onboarding";
import { GlobalLoading } from "@/src/components/global-loading";
import { ErrorComponent } from "@/src/components/ui/error";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useToast } from "@/src/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Building, Mail, Clock } from "lucide-react";
import { PendingInvitation } from "@/src/types";
import { useClerk, useUser } from "@clerk/nextjs";

export default function OnboardingPage() {
    const { invitations, isLoading, isError, mutate } = useGetPendingInvitations();
    const { acceptInvitation } = useAcceptInvitation();
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();
    const { setActive } = useClerk();

    const handleAccept = async (token: string) => {
        try {
            const { organizationId, organizationRole } = await acceptInvitation(token);
            
            if (user && setActive) {
                await user.update({
                    unsafeMetadata: {
                        organizationId,
                        organizationRole,
                    },
                });

                // Manually reload the user's session
                await setActive({
                    organization: organizationId,
                });

                toast({
                    title: "Invitation Accepted",
                    description: "You have successfully joined the organization.",
                });
                mutate();
                router.push("/");
            } else {
                // Fallback if user session is not available
                router.push('/sign-in');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to accept the invitation. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <GlobalLoading />;
    if (isError) return <ErrorComponent title="Error" description="Could not load invitations." />;

    return (
        <div className="container mx-auto py-12">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-4">Join an Organization</h1>
                <p className="text-center text-gray-600 mb-8">You have been invited to join the following organizations. Accept an invitation to start collaborating.</p>

                {invitations && invitations.length > 0 ? (
                    <div className="space-y-4">
                        {invitations.map((invite: PendingInvitation) => (
                            <Card key={invite.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Building className="mr-2" />
                                        {invite.organizationName}
                                    </CardTitle>
                                    <CardDescription>
                                        Invited by {invite.invitedBy.name} ({invite.invitedBy.email})
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>Sent on {new Date(invite.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={() => handleAccept(invite.token)}>Accept Invitation</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center p-8">
                        <Mail className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium">No Pending Invitations</h3>
                        <p className="mt-1 text-sm text-gray-600">You do not have any pending invitations at this time.</p>
                    </Card>
                )}
            </div>
        </div>
    );
} 