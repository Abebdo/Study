"use client"

import React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePlatform } from "@/lib/auth-context"
import type { UserRole } from "@/lib/store"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const { isAuthenticated, currentUser } = usePlatform()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in")
      return
    }
    if (requiredRoles && currentUser && !requiredRoles.includes(currentUser.role)) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, currentUser, requiredRoles, router])

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (requiredRoles && currentUser && !requiredRoles.includes(currentUser.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
