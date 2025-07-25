"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { X, Plus, Save, Edit2, Building2, MapPin, Users, Award, Globe, Calendar } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import axiosInstance from "@/src/api/axios";
import useSWR from "swr";

interface OrganizationProfileProps {
    organizationId: number;
}

const industryOptions = [
    "Manufacturing",
    "Technology",
    "Healthcare",
    "Finance",
    "Retail",
    "Energy",
    "Transportation",
    "Agriculture",
    "Construction",
    "Textiles & Apparel",
    "Food & Beverage",
    "Automotive",
    "Electronics",
    "Chemicals",
    "Other"
];

const certificationOptions = [
    "ISO 14001",
    "ISO 45001",
    "ISO 9001",
    "LEED",
    "Energy Star",
    "B Corp",
    "Fair Trade",
    "Cradle to Cradle",
    "EPEAT",
    "FSC",
    "OEKO-TEX",
    "GOTS",
    "GRS",
    "WRAP",
    "SA8000",
    "BSCI",
    "SMETA",
    "SEDEX"
];

const capabilityOptions = [
    "Carbon Footprint Tracking",
    "Supply Chain Transparency",
    "Renewable Energy",
    "Waste Management",
    "Water Conservation",
    "Sustainable Packaging",
    "Social Impact Measurement",
    "Employee Wellness",
    "Community Engagement",
    "Ethical Sourcing",
    "Circular Economy",
    "Life Cycle Assessment",
    "Environmental Reporting",
    "Supplier Assessment",
    "Risk Management",
    "Compliance Monitoring"
];

const sizeOptions = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-100", label: "51-100 employees" },
    { value: "101-500", label: "101-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1001-5000", label: "1001-5000 employees" },
    { value: "5000+", label: "5000+ employees" }
];

export function OrganizationProfile({ organizationId }: OrganizationProfileProps) {
    const { showSuccessToast, showErrorToast } = useToast();

    // Inline useGetOrganization hook
    const { data: organization, isLoading: isLoadingOrg, mutate } = useSWR(
        organizationId ? `/organizations/${organizationId}` : null,
        (url: string) => axiosInstance.get(url).then((res) => res.data),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false); const [formData, setFormData] = useState({
        name: "",
        description: "",
        industry: "",
        location: "",
        website: "",
        size: "",
        foundedYear: "",
        capabilities: [] as string[],
        certifications: [] as string[],
    });

    useEffect(() => {
        if (organization) {
            setFormData({
                name: organization.name || "",
                description: organization.description || "",
                industry: organization.industry || "",
                location: organization.location || "",
                website: organization.website || "",
                size: organization.size || "",
                foundedYear: organization.foundedYear || "",
                capabilities: organization.capabilities || [],
                certifications: organization.certifications || [],
            });
        }
    }, [organization]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            await axiosInstance.put(`/organizations/${organizationId}`, formData);
            await mutate(); // Refresh the organization data
            showSuccessToast("Organization profile updated successfully");
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating organization:", error);
            showErrorToast("Failed to update organization profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (organization) {
            setFormData({
                name: organization.name || "",
                description: organization.description || "",
                industry: organization.industry || "",
                location: organization.location || "",
                website: organization.website || "",
                size: organization.size || "",
                foundedYear: organization.foundedYear || "",
                capabilities: organization.capabilities || [],
                certifications: organization.certifications || [],
            });
        }
        setIsEditing(false);
    };

    const addCapability = (capability: string) => {
        if (!formData.capabilities.includes(capability)) {
            setFormData(prev => ({
                ...prev,
                capabilities: [...prev.capabilities, capability]
            }));
        }
    };

    const removeCapability = (capability: string) => {
        setFormData(prev => ({
            ...prev,
            capabilities: prev.capabilities.filter(c => c !== capability)
        }));
    };

    const addCertification = (certification: string) => {
        if (!formData.certifications.includes(certification)) {
            setFormData(prev => ({
                ...prev,
                certifications: [...prev.certifications, certification]
            }));
        }
    };

    const removeCertification = (certification: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(c => c !== certification)
        }));
    };

    if (isLoadingOrg) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Organization Profile</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage your organization's information and capabilities
                    </p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isLoading}>
                                <Save className="h-4 w-4 mr-2" />
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Basic Information
                        </CardTitle>
                        <CardDescription>
                            Core details about your organization
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    disabled={!isEditing}
                                    placeholder="Enter organization name"
                                    className={!isEditing ? "bg-gray-50" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Select
                                    value={formData.industry}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industryOptions.map((industry) => (
                                            <SelectItem key={industry} value={industry}>
                                                {industry}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    disabled={!isEditing}
                                    placeholder="City, State/Region, Country"
                                    className={!isEditing ? "bg-gray-50" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="website" className="flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    Website
                                </Label>
                                <Input
                                    id="website"
                                    value={formData.website}
                                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                    disabled={!isEditing}
                                    placeholder="https://example.com"
                                    className={!isEditing ? "bg-gray-50" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="size" className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Company Size
                                </Label>
                                <Select
                                    value={formData.size}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                                        <SelectValue placeholder="Select company size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="foundedYear" className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Founded Year
                                </Label>
                                <Input
                                    id="foundedYear"
                                    value={formData.foundedYear}
                                    onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: e.target.value }))}
                                    disabled={!isEditing}
                                    placeholder="e.g., 2020"
                                    className={!isEditing ? "bg-gray-50" : ""}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                disabled={!isEditing}
                                placeholder="Describe your organization's mission, values, and activities"
                                rows={4}
                                className={!isEditing ? "bg-gray-50" : ""}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ESG Capabilities */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            ESG Capabilities
                        </CardTitle>
                        <CardDescription>
                            Your organization's sustainability and ESG capabilities
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {formData.capabilities.length > 0 ? (
                                formData.capabilities.map((capability) => (
                                    <Badge key={capability} variant="secondary" className="flex items-center gap-1 text-sm py-1">
                                        {capability}
                                        {isEditing && (
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                                                onClick={() => removeCapability(capability)}
                                            />
                                        )}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No capabilities added yet</p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="pt-2">
                                <Select onValueChange={addCapability}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Add a capability" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {capabilityOptions
                                            .filter(cap => !formData.capabilities.includes(cap))
                                            .map((capability) => (
                                                <SelectItem key={capability} value={capability}>
                                                    {capability}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Certifications & Standards
                        </CardTitle>
                        <CardDescription>
                            Environmental, social, and sustainability certifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {formData.certifications.length > 0 ? (
                                formData.certifications.map((certification) => (
                                    <Badge key={certification} variant="outline" className="flex items-center gap-1 text-sm py-1 border-green-200 text-green-700">
                                        <Award className="h-3 w-3" />
                                        {certification}
                                        {isEditing && (
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-red-500 transition-colors"
                                                onClick={() => removeCertification(certification)}
                                            />
                                        )}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No certifications added yet</p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="pt-2">
                                <Select onValueChange={addCertification}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Add a certification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {certificationOptions
                                            .filter(cert => !formData.certifications.includes(cert))
                                            .map((certification) => (
                                                <SelectItem key={certification} value={certification}>
                                                    {certification}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Organization Stats */}
                {!isEditing && organization && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Overview</CardTitle>
                            <CardDescription>
                                Key information about your organization
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{formData.capabilities.length}</div>
                                    <div className="text-sm text-gray-600">ESG Capabilities</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{formData.certifications.length}</div>
                                    <div className="text-sm text-gray-600">Certifications</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{organization.verificationStatus || 'Pending'}</div>
                                    <div className="text-sm text-gray-600">Verification Status</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
