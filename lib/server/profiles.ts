import type { User } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { normalizeRole } from "@/lib/auth/roles"

export type ProfileBootstrapResult = {
  profile: {
    id: string
    email: string
    full_name: string
    role: ReturnType<typeof normalizeRole>
  }
  created: boolean
}

function buildProfilePayload(user: User) {
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
    role: normalizeRole(user.user_metadata?.role),
  }
}

/**
 * Creates (or normalizes) a user's profile record.
 * This is safe to call repeatedly from callback, middleware, and API guards.
 */
export async function ensureProfileForUser(user: User): Promise<ProfileBootstrapResult> {
  const profilePayload = buildProfilePayload(user)

  const supabase = await createClient()

  const existing = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  if (existing.data) {
    const normalizedRole = normalizeRole(existing.data.role)
    if (
      existing.data.email !== profilePayload.email ||
      existing.data.full_name !== profilePayload.full_name ||
      existing.data.role !== normalizedRole
    ) {
      await supabase
        .from("profiles")
        .update({
          email: profilePayload.email,
          full_name: profilePayload.full_name,
          role: normalizedRole,
        })
        .eq("id", user.id)
    }

    return {
      created: false,
      profile: {
        id: existing.data.id,
        email: existing.data.email ?? profilePayload.email,
        full_name: existing.data.full_name ?? profilePayload.full_name,
        role: normalizedRole,
      },
    }
  }

  const attempt = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" })

  if (!attempt.error) {
    return {
      created: true,
      profile: profilePayload,
    }
  }

  try {
    const admin = createAdminClient()
    const adminAttempt = await admin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })

    if (adminAttempt.error) {
      throw adminAttempt.error
    }

    return {
      created: true,
      profile: profilePayload,
    }
  } catch {
    throw new Error("PROFILE_UPSERT_FAILED")
  }
}
