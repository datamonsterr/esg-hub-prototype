"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"

interface WidgetCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function WidgetCard({ title, children, className }: WidgetCardProps) {
  return (
    <Card className={`border-border-light rounded-brand ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
} 