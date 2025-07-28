"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { toast } from "sonner";
import { useToast } from "@/src/hooks/use-toast";
import { sendInvite } from "@/src/api/user";
import { InviteRequest } from "@/src/types/user";

interface InviteUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
    onInviteSuccess: () => void;
}

export function InviteUserDialog({
    isOpen,
    onClose,
    organizationId,
    onInviteSuccess,
}: InviteUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccessToast, showErrorToast } = useToast();
    const [formData, setFormData] = useState({
        email: "",
        organizationRole: "employee" as "admin" | "employee",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const inviteData: Omit<
                InviteRequest,
                "id" | "token" | "status" | "createdAt" | "expiresAt"
            > = {
                email: formData.email,
                organizationId: organizationId,
                organizationRole: formData.organizationRole,
                invitedBy: "current-user-id", // You'd get this from your auth context
            };

            await sendInvite(inviteData);

            showSuccessToast(`Invitation has been sent to ${formData.email}`);

            onInviteSuccess();
            onClose();
            setFormData({ email: "", organizationRole: "employee" });
        } catch (error) {
            console.error("Error sending invite:", error);
            showErrorToast("Failed to send invitation. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                        Send an invitation to join your organization.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.organizationRole}
                            onValueChange={(value: "admin" | "employee") =>
                                setFormData({ ...formData, organizationRole: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Sending..." : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
