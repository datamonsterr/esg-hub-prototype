'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Separator } from '@/src/components/ui/separator';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useLeaveOrganization } from '@/src/api/organization';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/src/components/ui/alert-dialog';

export default function OrganizationSettingsPage() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const router = useRouter();
    const [isLeaving, setIsLeaving] = useState(false);
    const { leaveOrganization } = useLeaveOrganization();

    const organizationMembership = user?.organizationMemberships?.[0];
    const organization = organizationMembership?.organization;
    const userRole = organizationMembership?.role;

    const handleLeaveOrganization = async () => {
        if (!organizationMembership || !organization) return;

        setIsLeaving(true);
        try {
            // Call our API endpoint first (for any server-side cleanup)
            await leaveOrganization(organization.id);

            // Leave the organization via Clerk
            await organizationMembership.destroy();

            // Sign out and redirect to home page
            await signOut(() => router.push('/'));
        } catch (error) {
            console.error('Error leaving organization:', error);
            setIsLeaving(false);
        }
    };

    if (!organization) {
        return (
            <div className="container mx-auto py-10">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">You are not currently a member of any organization.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                <p className="text-muted-foreground">
                    Manage your organization membership and settings.
                </p>
            </div>

            <Separator />

            {/* Organization Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Organization Information</CardTitle>
                    <CardDescription>
                        Details about your current organization membership.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                            <p className="text-sm">{organization.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Your Role</label>
                            <p className="text-sm capitalize">{userRole?.replace('org:', '')}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                            <p className="text-sm">
                                {organizationMembership.createdAt
                                    ? new Date(organizationMembership.createdAt).toLocaleDateString()
                                    : 'Unknown'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Actions in this section are irreversible. Please proceed with caution.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium">Leave Organization</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Once you leave this organization, you will lose access to all organization resources and data.
                                You will need to be invited again to rejoin.
                            </p>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        disabled={isLeaving}
                                        className="gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {isLeaving ? 'Leaving...' : 'Leave Organization'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. You will leave &quot;{organization.name}&quot; and lose access to:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>All organization data and reports</li>
                                                <li>Shared documents and assessments</li>
                                                <li>Team collaboration features</li>
                                                <li>Organization-specific integrations</li>
                                            </ul>
                                            <br />
                                            You will be signed out and redirected to the home page.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleLeaveOrganization}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            disabled={isLeaving}
                                        >
                                            {isLeaving ? 'Leaving...' : 'Yes, leave organization'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
