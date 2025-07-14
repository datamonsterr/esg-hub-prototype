"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useModal } from "../context/modal/modal-context";
import { RoleSelectionModalContent } from "./role-selection-modal-content";
import { Edit, LogOut, User } from "lucide-react";

export function UserAccountNav() {
  const { showModal } = useModal();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-9 w-9 cursor-pointer">
          <AvatarImage src={user.imageUrl} alt={user.fullName ?? "User"} />
          <AvatarFallback>
            {user.firstName?.charAt(0)}
            {user.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openUserProfile()}>
          <User className="mr-2 h-4 w-4" />
          <span>Manage Account</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => showModal(<RoleSelectionModalContent />)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Change Role</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut(() => router.push("/"))}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 