import { createClient } from "@supabase/supabase-js"
import { assertSupabasePublicConfig } from "@/lib/supabase/config"

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY_MISSING")
  }
  return key
}

export function createAdminClient() {
  const { url } = assertSupabasePublicConfig()
  const serviceRoleKey = getServiceRoleKey()

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
