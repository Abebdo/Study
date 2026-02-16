"use client"

import Link from "next/link"
import { ShieldCheck, Users, BookOpen, AlertTriangle } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

const cards = [
  { title: "Users", value: "Managed via Supabase", icon: Users },
  { title: "Courses", value: "Review teacher submissions", icon: BookOpen },
  { title: "Safety", value: "Track abuse reports", icon: AlertTriangle },
]

export default function AdminPage() {
  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-sm text-muted-foreground">Operational overview for moderation, compliance, and platform health.</p>
        </div>

        <div className="mb-4">
          <Link href="/dashboard/admin/launch-readiness" className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
            Open 125-feature launch checklist
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.title} className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <card.icon className="h-5 w-5 text-foreground" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">{card.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  )
}
