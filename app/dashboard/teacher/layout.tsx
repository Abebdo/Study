import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/server/auth"

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  try {
    await requireAuth(["instructor", "admin"])
    return <>{children}</>
  } catch {
    redirect("/dashboard")
  }
}
