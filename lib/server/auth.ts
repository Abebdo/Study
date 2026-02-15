import { createClient } from "@/lib/supabase/server"
import { ensureProfileForUser } from "@/lib/server/profiles"
import { normalizeRole, type AppRole } from "@/lib/auth/roles"

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

  await ensureProfileForUser(user)

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    throw new Error("PROFILE_NOT_FOUND")
  }

  const roleName = normalizeRole(profile.role)

  // Best-effort migration path for older 'instructor' values.
  if (profile.role !== roleName) {
    await supabase.from("profiles").update({ role: roleName }).eq("id", user.id)
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
