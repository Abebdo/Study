import { createClient } from "@supabase/supabase-js"

import { getSupabasePublicConfig } from "@/lib/supabase/config"

export function createAdminClient() {
  const { url, isConfigured } = getSupabasePublicConfig()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!isConfigured || !url || !serviceRoleKey) {
    throw new Error("SUPABASE_ADMIN_NOT_CONFIGURED")
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
