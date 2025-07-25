"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { UserPlus, Users, Settings, Shield, Building } from "lucide-react";
import { UserManagementTable } from "@/src/components/admin/user-management-table";
import { InviteUserDialog } from "@/src/components/admin/invite-user-dialog";
import { OrganizationProfile } from "@/src/components/admin/organization-profile";
import { OrganizationSettings } from "@/src/components/admin/organization-settings";
import { OrganizationAnalytics } from "@/src/components/admin/organization-analytics";
import { useGetUserOrg } from "@/src/api/user";
import { useUserContext, useIsAdmin } from "@/src/hooks/useUserContext";
import { useGetOrganization } from "@/src/api/organization";

export default function AdminPage() {
    const { organizationId, organizationRole, userId } = useUserContext();
    const { organization } = useGetOrganization(organizationId?.toString() || "1");
    const isAdmin = useIsAdmin();
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    if (!organizationId || !organization) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-gray-600">You must be part of an organization to access this page.</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
                    <p className="text-gray-600">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your organization: {organization?.name}
                    </p>
                </div>
            </div>

            <Tabs defaultValue="users" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="users" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User Management
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Organization Profile
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        User Management
                                    </CardTitle>
                                    <CardDescription>
                                        Manage members and invitations for your organization
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setShowInviteDialog(true)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Invite User
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <UserManagementTable
                                organizationId={organizationId || 0}
                                currentUserRole={organizationRole === "admin" ? "admin" : "employee"}
                                currentUserId={userId || ""}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile" className="space-y-6">
                    <OrganizationProfile
                        organizationId={organizationId || 0}
                    />
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <OrganizationSettings organizationId={organizationId || 0} />
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <OrganizationAnalytics
                        organization={{
                            id: organizationId || 0,
                            name: organization?.name || "",
                            address: organization?.address || "",
                            createdAt: organization?.createdAt || ""
                        }}
                        organizationId={organizationId?.toString() || "0"}
                    />
                </TabsContent>
            </Tabs>

            {/* Invite User Dialog */}
            <InviteUserDialog
                isOpen={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
                organizationId={organizationId?.toString() || "0"}
                onInviteSuccess={() => {
                    // Refresh data if needed
                    window.location.reload();
                }}
            />
        </div>
    );
}
