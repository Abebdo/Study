import { createBrowserClient } from "@supabase/ssr"
import { getSupabasePublicConfig } from "@/lib/supabase/config"

export function createClient() {
  const { url, anonKey, isConfigured } = getSupabasePublicConfig()

  if (!isConfigured || !url || !anonKey) {
    throw new Error("SUPABASE_NOT_CONFIGURED")
  }

  return createBrowserClient(url, anonKey)
}
