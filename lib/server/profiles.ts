import type { User } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { normalizeRole } from "@/lib/auth/roles"

export async function ensureProfileForUser(user: User) {
  const profilePayload = {
    id: user.id,
    email: user.email ?? "",
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
    role: normalizeRole(user.user_metadata?.role),
  }

  const supabase = await createClient()
  const attempt = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id", ignoreDuplicates: true })

  if (!attempt.error) {
    return
  }

  try {
    const admin = createAdminClient()
    const adminAttempt = await admin
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id", ignoreDuplicates: true })

    if (adminAttempt.error) {
      throw adminAttempt.error
    }
  } catch {
    throw new Error("PROFILE_UPSERT_FAILED")
  }
}
