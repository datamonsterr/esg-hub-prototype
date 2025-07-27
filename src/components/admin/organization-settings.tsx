"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import {
    Settings,
    Shield,
    Bell,
    Lock,
    Users,
    Mail,
    Database,
    AlertTriangle,
    Info
} from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import axiosInstance from "@/src/api/axios";

interface OrganizationSettingsProps {
    organizationId: number;
}

interface SettingsData {
    notifications: {
        emailNotifications: boolean;
        traceabilityUpdates: boolean;
        membershipChanges: boolean;
        systemAlerts: boolean;
    };
    privacy: {
        allowDataSharing: boolean;
        publicProfile: boolean;
        allowAnalytics: boolean;
    };
    security: {
        requireTwoFactor: boolean;
        sessionTimeout: number;
        allowApiAccess: boolean;
    };
    collaboration: {
        allowGuestAccess: boolean;
        autoApproveRequests: boolean;
        shareTraceabilityData: boolean;
    };
}

export function OrganizationSettings({ organizationId }: OrganizationSettingsProps) {
    const { showSuccessToast, showErrorToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [settings, setSettings] = useState<SettingsData>({
        notifications: {
            emailNotifications: true,
            traceabilityUpdates: true,
            membershipChanges: true,
            systemAlerts: false,
        },
        privacy: {
            allowDataSharing: false,
            publicProfile: true,
            allowAnalytics: true,
        },
        security: {
            requireTwoFactor: false,
            sessionTimeout: 24,
            allowApiAccess: true,
        },
        collaboration: {
            allowGuestAccess: false,
            autoApproveRequests: false,
            shareTraceabilityData: true,
        },
    });

    const loadSettings = useCallback(async () => {
        try {
            setIsLoadingSettings(true);
            const response = await axiosInstance.get(`/organizations/${organizationId}/settings`);
            if (response.data) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            // Use default settings if API fails
        } finally {
            setIsLoadingSettings(false);
        }
    }, [organizationId]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSaveSettings = async () => {
        try {
            setIsLoading(true);
            await axiosInstance.put(`/organizations/${organizationId}/settings`, settings);
            showSuccessToast("Settings saved successfully");
        } catch (error) {
            console.error("Error saving settings:", error);
            showErrorToast("Failed to save settings");
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = (category: keyof SettingsData, key: string, value: boolean | number) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    if (isLoadingSettings) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    } return (
        <div className="space-y-6">
            {/* Notifications Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Configure how and when you receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-gray-600">Receive important updates via email</p>
                        </div>
                        <Switch
                            checked={settings.notifications.emailNotifications}
                            onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Traceability Updates</Label>
                            <p className="text-sm text-gray-600">Get notified about traceability request changes</p>
                        </div>
                        <Switch
                            checked={settings.notifications.traceabilityUpdates}
                            onCheckedChange={(checked) => updateSetting('notifications', 'traceabilityUpdates', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Membership Changes</Label>
                            <p className="text-sm text-gray-600">Notifications when team members join or leave</p>
                        </div>
                        <Switch
                            checked={settings.notifications.membershipChanges}
                            onCheckedChange={(checked) => updateSetting('notifications', 'membershipChanges', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>System Alerts</Label>
                            <p className="text-sm text-gray-600">Critical system notifications and maintenance alerts</p>
                        </div>
                        <Switch
                            checked={settings.notifications.systemAlerts}
                            onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Privacy & Data Sharing
                    </CardTitle>
                    <CardDescription>
                        Control how your organization&apos;s data is shared and used
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Allow Data Sharing</Label>
                            <p className="text-sm text-gray-600">Share anonymized data for industry insights</p>
                        </div>
                        <Switch
                            checked={settings.privacy.allowDataSharing}
                            onCheckedChange={(checked) => updateSetting('privacy', 'allowDataSharing', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Public Profile</Label>
                            <p className="text-sm text-gray-600">Make organization profile visible to other users</p>
                        </div>
                        <Switch
                            checked={settings.privacy.publicProfile}
                            onCheckedChange={(checked) => updateSetting('privacy', 'publicProfile', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Analytics</Label>
                            <p className="text-sm text-gray-600">Allow usage analytics to improve the platform</p>
                        </div>
                        <Switch
                            checked={settings.privacy.allowAnalytics}
                            onCheckedChange={(checked) => updateSetting('privacy', 'allowAnalytics', checked)}
                        />
                    </div>

                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Your privacy is important to us. We never share personally identifiable information without your explicit consent.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Security Settings
                    </CardTitle>
                    <CardDescription>
                        Configure security options for your organization
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Require Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-600">Require 2FA for all organization members</p>
                        </div>
                        <Switch
                            checked={settings.security.requireTwoFactor}
                            onCheckedChange={(checked) => updateSetting('security', 'requireTwoFactor', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>API Access</Label>
                            <p className="text-sm text-gray-600">Allow API access for integrations</p>
                        </div>
                        <Switch
                            checked={settings.security.allowApiAccess}
                            onCheckedChange={(checked) => updateSetting('security', 'allowApiAccess', checked)}
                        />
                    </div>

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Enabling two-factor authentication will require all members to set up 2FA on their next login.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Collaboration Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Collaboration Settings
                    </CardTitle>
                    <CardDescription>
                        Configure how your organization collaborates with partners
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Allow Guest Access</Label>
                            <p className="text-sm text-gray-600">Let external partners view limited data</p>
                        </div>
                        <Switch
                            checked={settings.collaboration.allowGuestAccess}
                            onCheckedChange={(checked) => updateSetting('collaboration', 'allowGuestAccess', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Auto-approve Requests</Label>
                            <p className="text-sm text-gray-600">Automatically approve traceability requests from verified partners</p>
                        </div>
                        <Switch
                            checked={settings.collaboration.autoApproveRequests}
                            onCheckedChange={(checked) => updateSetting('collaboration', 'autoApproveRequests', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Share Traceability Data</Label>
                            <p className="text-sm text-gray-600">Allow sharing of supply chain traceability information</p>
                        </div>
                        <Switch
                            checked={settings.collaboration.shareTraceabilityData}
                            onCheckedChange={(checked) => updateSetting('collaboration', 'shareTraceabilityData', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                    <Settings className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}
