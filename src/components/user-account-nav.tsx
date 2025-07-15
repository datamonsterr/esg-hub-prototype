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
import { Edit, LogOut, User, LogIn } from "lucide-react";
import { Button } from "./ui/button";

export function UserAccountNav() {
  const { showModal } = useModal();
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile, openSignIn } = useClerk();
  const router = useRouter();

  // Show loading state if user is not loaded yet
  if (!isLoaded) {
    return (
      <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  // Show sign-in button if no user
  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => openSignIn()}
        className="flex items-center gap-2"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="h-9 w-9 cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors">
          <AvatarImage 
            src={user.imageUrl} 
            alt={user.fullName ?? "User"} 
            className="object-cover"
          />
          <AvatarFallback className="bg-brand-primary text-white font-medium">
            {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || "U"}
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