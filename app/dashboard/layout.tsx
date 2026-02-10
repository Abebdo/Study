"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AIAssistant } from "@/components/ai-assistant"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <AIAssistant />
      </div>
    </AuthGuard>
  )
}
