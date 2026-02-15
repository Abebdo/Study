import { createClient } from "@/lib/supabase/server"
import { ensureProfileForUser } from "@/lib/server/profiles"
import { normalizeRole, type AppRole } from "@/lib/auth/roles"

export interface AuthContext {
  userId: string
  role: AppRole
  fullName: string
}

/**
 * Server-side auth guard used by API routes and restricted pages.
 * It treats the Supabase session as the source of truth and only uses
 * profiles for role/full-name enrichment.
 */
export async function requireAuth(allowedRoles?: AppRole[]): Promise<AuthContext> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error("UNAUTHORIZED")
  }

  const fallbackRole = normalizeRole(user.user_metadata?.role)
  const fallbackName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""

  try {
    await ensureProfileForUser(user)
  } catch (error) {
    console.warn("[requireAuth] could not upsert profile", {
      userId: user.id,
      error: error instanceof Error ? error.message : "unknown",
    })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  const roleName = normalizeRole(profile?.role ?? fallbackRole)

  if (allowedRoles && !allowedRoles.includes(roleName)) {
    throw new Error("FORBIDDEN")
  }

  return {
    userId: profile?.id ?? user.id,
    fullName: profile?.full_name ?? fallbackName,
    role: roleName,
  }
}
