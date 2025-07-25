'use client';

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserContext } from "@/src/hooks/useUserContext";

export default function SupplierTraceabilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
} 