import { createClient } from "@/lib/supabase/server"

export type AppRole = "student" | "instructor" | "admin"

export interface AuthContext {
  userId: string
  role: AppRole
  fullName: string
}

export async function requireAuth(allowedRoles?: AppRole[]): Promise<AuthContext> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("UNAUTHORIZED")
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, full_name, roles(name)")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.roles || typeof profile.roles !== "object") {
    throw new Error("PROFILE_NOT_FOUND")
  }

  const roleName = (profile.roles as { name?: string }).name
  if (roleName !== "student" && roleName !== "instructor" && roleName !== "admin") {
    throw new Error("INVALID_ROLE")
  }

  if (allowedRoles && !allowedRoles.includes(roleName)) {
    throw new Error("FORBIDDEN")
  }

  return {
    userId: profile.id,
    fullName: profile.full_name ?? "",
    role: roleName,
  }
}
