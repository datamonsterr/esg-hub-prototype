"use client"

import { cancelInvite, removeMember, resendInvite, sendInvite, updateMemberRole, useGetOrganizationInvites, useGetOrganizationMembers } from "@/src/api/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { InviteRequest, OrganizationMember } from "@/src/types"
import { useUser } from "@clerk/nextjs"
import { CheckCircle, Clock, Mail, MoreHorizontal, Plus, Shield, User, UserMinus, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function UserManagementPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "employee">("employee")
  const [isLoading, setIsLoading] = useState(false)

  const organizationId = user?.unsafeMetadata?.organizationId as string
  const organizationRole = user?.unsafeMetadata?.organizationRole as "admin" | "employee"

  const { data: members, mutate: mutateMembers } = useGetOrganizationMembers(organizationId)
  const { data: invites, mutate: mutateInvites } = useGetOrganizationInvites(organizationId)

  useEffect(() => {
    if (isLoaded && user) {
      if (!organizationId) {
        router.replace("/onboarding")
        return
      }
      
      if (organizationRole !== "admin") {
        router.replace("/")
        return
      }
    }
  }, [isLoaded, user, organizationId, organizationRole, router])

  const handleSendInvite = async () => {
    if (!inviteEmail || !organizationId) return

    setIsLoading(true)
    try {
      await sendInvite({
        email: inviteEmail,
        organizationId,
        organizationRole: inviteRole,
        invitedBy: user!.id,
      })
      
      setInviteEmail("")
      setInviteRole("employee")
      setShowInviteDialog(false)
      mutateInvites()
    } catch (error) {
      console.error("Failed to send invite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: "admin" | "employee") => {
    try {
      await updateMemberRole(organizationId, memberId, newRole)
      mutateMembers()
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(organizationId, memberId)
      mutateMembers()
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite(inviteId)
      mutateInvites()
    } catch (error) {
      console.error("Failed to cancel invite:", error)
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInvite(inviteId)
      mutateInvites()
    } catch (error) {
      console.error("Failed to resend invite:", error)
    }
  }

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Redirect if not authenticated or not admin
  if (!user || !organizationId || organizationRole !== "admin") {
    return null
  }

  const getRoleVariant = (role: string) => {
    return role === "admin" ? "default" : "secondary"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "suspended":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage organization members and invitations</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Organization Members */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>
              Users who are currently part of your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members?.map((member: OrganizationMember) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="" alt="" />
                      <AvatarFallback>
                        {member.userId.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.userId}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(member.status)}
                        <Badge variant={getRoleVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleUpdateRole(member.id, member.role === "admin" ? "employee" : "admin")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {member.role === "admin" ? "Make Employee" : "Make Admin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              {!members?.length && (
                <p className="text-gray-500 text-center py-8">No members found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that have been sent but not yet accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invites?.map((invite: InviteRequest) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        <Mail className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{invite.status}</Badge>
                        <Badge variant={getRoleVariant(invite.organizationRole)}>
                          {invite.organizationRole}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(invite.id)}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
              {!invites?.length && (
                <p className="text-gray-500 text-center py-8">No pending invitations</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: "admin" | "employee") => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={!inviteEmail || isLoading}>
              {isLoading ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 