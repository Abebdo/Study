function normalizeEnv(value?: string) {
  if (!value) return ""
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function isValidSupabaseUrl(value: string) {
  return value.startsWith("https://") && value.includes(".supabase.co")
}

function isLikelyJwt(value: string) {
  return value.split(".").length === 3
}

function isLikelyPublishableKey(value: string) {
  return value.startsWith("sb_publishable_")
}

export function getSupabasePublicConfig() {
  const url = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = normalizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const isConfigured = Boolean(url && anonKey)

  const isValid = isValidSupabaseUrl(url) && (isLikelyPublishableKey(anonKey) || isLikelyJwt(anonKey))

  return { url, anonKey, isConfigured, isValid }
}

export function assertSupabasePublicConfig() {
  const config = getSupabasePublicConfig()

  if (!config.isConfigured) {
    throw new Error("SUPABASE_NOT_CONFIGURED")
  }

  if (!config.isValid) {
    throw new Error("SUPABASE_INVALID_PUBLIC_CONFIG")
  }

  return config
}
