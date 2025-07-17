"use client";

import React from 'react';

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container mx-auto py-8">{children}</div>;
}
