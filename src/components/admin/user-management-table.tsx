"use client";

import { useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, Trash2, Crown, User } from "lucide-react";
import { OrganizationMember, InviteRequest } from "@/src/types/user";
import {
    useGetOrganizationMembers,
    useGetOrganizationInvites,
    updateMemberRole,
    removeMember,
    cancelInvite,
    resendInvite
} from "@/src/api/user";
import { useToast } from "@/src/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";

interface UserManagementTableProps {
    organizationId: string;
    currentUserRole: "admin" | "employee";
    currentUserId: string;
}

export function UserManagementTable({
    organizationId,
    currentUserRole,
    currentUserId,
}: UserManagementTableProps) {
    const { showSuccessToast, showErrorToast } = useToast();
    const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);
    const [inviteToCancel, setInviteToCancel] = useState<InviteRequest | null>(null);

    const {
        data: members = [],
        isLoading: membersLoading,
        mutate: refetchMembers
    } = useGetOrganizationMembers(organizationId);

    const {
        data: invites = [],
        isLoading: invitesLoading,
        mutate: refetchInvites
    } = useGetOrganizationInvites(organizationId);

    const handleRoleChange = async (memberId: string, newRole: "admin" | "employee") => {
        try {
            await updateMemberRole(organizationId, memberId, newRole);
            showSuccessToast(`Role updated successfully`);
            refetchMembers();
        } catch (error) {
            console.error("Error updating role:", error);
            showErrorToast("Failed to update role");
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;

        try {
            await removeMember(organizationId, memberToRemove.id);
            showSuccessToast("Member removed successfully");
            refetchMembers();
            setMemberToRemove(null);
        } catch (error) {
            console.error("Error removing member:", error);
            showErrorToast("Failed to remove member");
        }
    };

    const handleCancelInvite = async () => {
        if (!inviteToCancel) return;

        try {
            await cancelInvite(inviteToCancel.id);
            showSuccessToast("Invitation cancelled");
            refetchInvites();
            setInviteToCancel(null);
        } catch (error) {
            console.error("Error cancelling invite:", error);
            showErrorToast("Failed to cancel invitation");
        }
    };

    const handleResendInvite = async (inviteId: string) => {
        try {
            await resendInvite(inviteId);
            showSuccessToast("Invitation resent");
            refetchInvites();
        } catch (error) {
            console.error("Error resending invite:", error);
            showErrorToast("Failed to resend invitation");
        }
    };

    const isAdmin = currentUserRole === "admin";
    const isLoading = membersLoading || invitesLoading;

    if (isLoading) {
        return <div className="flex justify-center p-4">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Active Members */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Active Members</h3>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                {isAdmin && <TableHead className="w-[70px]">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {member.role === "admin" ? (
                                                <Crown className="h-4 w-4 text-yellow-500" />
                                            ) : (
                                                <User className="h-4 w-4 text-gray-500" />
                                            )}
                                            {member.userId === currentUserId ? "You" : "User"}
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.userId}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                member.status === "active" ? "default" :
                                                    member.status === "pending" ? "secondary" : "destructive"
                                            }
                                        >
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {member.joinedAt
                                            ? new Date(member.joinedAt).toLocaleDateString()
                                            : "N/A"
                                        }
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell>
                                            {member.userId !== currentUserId && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleRoleChange(
                                                                    member.id,
                                                                    member.role === "admin" ? "employee" : "admin"
                                                                )
                                                            }
                                                        >
                                                            {member.role === "admin" ? "Make Employee" : "Make Admin"}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setMemberToRemove(member)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {members.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                                        No members found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pending Invitations */}
            {isAdmin && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Pending Invitations</h3>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Invited</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="w-[70px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invites.map((invite) => (
                                    <TableRow key={invite.id}>
                                        <TableCell>{invite.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={invite.organizationRole === "admin" ? "default" : "secondary"}>
                                                {invite.organizationRole}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {invite.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(invite.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(invite.expiresAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleResendInvite(invite.id)}
                                                    >
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Resend
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setInviteToCancel(invite)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {invites.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No pending invitations
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Remove Member Confirmation Dialog */}
            <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this member from the organization?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveMember}>
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Invite Confirmation Dialog */}
            <AlertDialog open={!!inviteToCancel} onOpenChange={() => setInviteToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this invitation?
                            The user will no longer be able to join using this invitation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelInvite}>
                            Cancel Invitation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
