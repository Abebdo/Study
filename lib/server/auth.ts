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

  const userRoleFromMeta = user.user_metadata?.role
  const fallbackRole = userRoleFromMeta === "admin" || userRoleFromMeta === "instructor" ? userRoleFromMeta : "student"

  const ensureProfile = async () => {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
        role: fallbackRole,
      },
      { onConflict: "id" },
    )
  }

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error("PROFILE_READ_FAILED")
  }

  if (!profile) {
    await ensureProfile()
    const result = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .single()

    profile = result.data
    profileError = result.error
  }

  if (profileError || !profile) {
    throw new Error("PROFILE_NOT_FOUND")
  }

  const roleName = profile.role
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
