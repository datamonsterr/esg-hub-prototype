"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import {
    Users,
    Shield,
    Activity,
    TrendingUp,
    Building,
    CheckCircle,
    AlertCircle,
    Clock,
    BarChart3
} from "lucide-react";
import { Organization } from "@/src/types/user";

interface OrganizationAnalyticsProps {
    organization: Organization;
    organizationId: string;
}

export function OrganizationAnalytics({ organization, organizationId }: OrganizationAnalyticsProps) {
    // Mock data - in a real app, this would come from an API
    const analyticsData = {
        members: {
            total: 12,
            active: 10,
            pending: 2,
            growth: 15.8
        },
        traceability: {
            completeness: 78,
            requests: 45,
            approved: 38,
            pending: 7
        },
        compliance: {
            score: 92,
            certifications: organization.certifications?.length || 0,
            lastAudit: "2024-06-15",
            nextAudit: "2024-12-15"
        },
        activity: {
            thisMonth: 156,
            lastMonth: 134,
            growth: 16.4
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-600";
        if (score >= 70) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreVariant = (score: number) => {
        if (score >= 90) return "default";
        if (score >= 70) return "secondary";
        return "destructive";
    };

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.members.total}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+{analyticsData.members.growth}%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Traceability Score</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.traceability.completeness}%</div>
                        <Progress value={analyticsData.traceability.completeness} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getScoreColor(analyticsData.compliance.score)}`}>
                            {analyticsData.compliance.score}%
                        </div>
                        <Badge variant={getScoreVariant(analyticsData.compliance.score)} className="mt-2">
                            {analyticsData.compliance.score >= 90 ? "Excellent" :
                                analyticsData.compliance.score >= 70 ? "Good" : "Needs Improvement"}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Activity</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData.activity.thisMonth}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+{analyticsData.activity.growth}%</span> vs last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Member Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Member Analytics
                        </CardTitle>
                        <CardDescription>
                            Overview of your organization&apos;s membership
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Active Members</span>
                            </div>
                            <span className="font-semibold">{analyticsData.members.active}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">Pending Invitations</span>
                            </div>
                            <span className="font-semibold">{analyticsData.members.pending}</span>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Member Activity Rate</span>
                                <span>{Math.round((analyticsData.members.active / analyticsData.members.total) * 100)}%</span>
                            </div>
                            <Progress value={(analyticsData.members.active / analyticsData.members.total) * 100} />
                        </div>
                    </CardContent>
                </Card>

                {/* Traceability Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Traceability Overview
                        </CardTitle>
                        <CardDescription>
                            Supply chain traceability metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm">Approved Requests</span>
                            </div>
                            <span className="font-semibold">{analyticsData.traceability.approved}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">Pending Requests</span>
                            </div>
                            <span className="font-semibold">{analyticsData.traceability.pending}</span>
                        </div>

                        <div className="pt-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Data Completeness</span>
                                <span>{analyticsData.traceability.completeness}%</span>
                            </div>
                            <Progress value={analyticsData.traceability.completeness} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Compliance & Certifications */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Compliance & Certifications
                    </CardTitle>
                    <CardDescription>
                        Your organization&apos;s compliance status and certifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Compliance Score</Label>
                            <div className={`text-3xl font-bold ${getScoreColor(analyticsData.compliance.score)}`}>
                                {analyticsData.compliance.score}%
                            </div>
                            <Progress value={analyticsData.compliance.score} className="mt-2" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Active Certifications</Label>
                            <div className="text-3xl font-bold text-green-600">
                                {analyticsData.compliance.certifications}
                            </div>
                            <p className="text-xs text-muted-foreground">Valid certifications</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Next Audit</Label>
                            <div className="text-lg font-semibold">
                                {new Date(analyticsData.compliance.nextAudit).toLocaleDateString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Last audit: {new Date(analyticsData.compliance.lastAudit).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {organization.certifications && organization.certifications.length > 0 && (
                        <div className="mt-6">
                            <Label className="text-sm font-medium mb-3 block">Current Certifications</Label>
                            <div className="flex flex-wrap gap-2">
                                {organization.certifications.map((cert) => (
                                    <Badge key={cert} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        {cert}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Organization Profile Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Organization Summary
                    </CardTitle>
                    <CardDescription>
                        Quick overview of your organization profile
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Organization Type</Label>
                            <p className="font-semibold capitalize">{organization.type?.replace(/_/g, " ")}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Verification Status</Label>
                            <div className="flex items-center gap-2">
                                <Badge variant={organization.verificationStatus === "verified" ? "default" : "secondary"}>
                                    {organization.verificationStatus}
                                </Badge>
                                {organization.verificationStatus === "verified" && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Capabilities</Label>
                            <p className="font-semibold">{organization.capabilities?.length || 0} active</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                            <p className="font-semibold">{new Date(organization.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
    return <label className={className}>{children}</label>;
}
