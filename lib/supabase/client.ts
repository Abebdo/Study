import { createBrowserClient } from "@supabase/ssr"
import { assertSupabasePublicConfig } from "@/lib/supabase/config"

export function createClient() {
  const { url, anonKey } = assertSupabasePublicConfig()

  return createBrowserClient(url, anonKey)
}
