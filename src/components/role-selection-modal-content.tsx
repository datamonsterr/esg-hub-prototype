"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useModal } from "@/src/context/modal/modal-context";
import { Factory, Store } from "lucide-react";
import { cn } from "@/src/lib/utils";

import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";

export function RoleSelectionModalContent() {
  const { user } = useUser();
  const router = useRouter();
  const { hideModal } = useModal();
  const [selectedRole, setSelectedRole] = useState<"supplier" | "brand" | null>(
    null
  );

  const handleUpdateRole = async () => {
    if (!user || !selectedRole) return;

    try {
      await user.update({
        unsafeMetadata: { userRole: selectedRole },
      });
      hideModal();
      router.refresh();
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const roles = [
    {
      id: "supplier",
      title: "Supplier",
      description: "You are a material manufacturer or producer.",
      icon: <Factory className="h-8 w-8 mb-4 mx-auto" />,
    },
    {
      id: "brand",
      title: "Brand",
      description: "You are a marketer and seller of products.",
      icon: <Store className="h-8 w-8 mb-4 mx-auto" />,
    },
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Welcome to Traceability Hub!</DialogTitle>
        <DialogDescription>
          To get started, please select your role. This will help us tailor your
          experience.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            onClick={() => setSelectedRole(role.id as "supplier" | "brand")}
            className={cn(
              "cursor-pointer border-2 p-6 text-center transition-all",
              selectedRole === role.id
                ? "border-green-500 bg-green-50"
                : "border-black hover:bg-gray-50"
            )}
          >
            <CardContent className="p-0 flex flex-col items-center justify-center">
              {role.icon}
              <h3 className="font-semibold text-lg">{role.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <DialogFooter>
        <Button onClick={handleUpdateRole} disabled={!selectedRole}>
          Continue
        </Button>
      </DialogFooter>
    </>
  );
} 