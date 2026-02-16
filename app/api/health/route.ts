import { NextResponse } from "next/server"
import { getSupabasePublicConfig } from "@/lib/supabase/config"

export async function GET() {
  const publicConfig = getSupabasePublicConfig()
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  const mode = process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? "demo" : "production"

  const checks = {
    supabasePublicConfigPresent: publicConfig.isConfigured,
    supabasePublicConfigValid: publicConfig.isValid,
    supabaseServiceRolePresent: hasServiceRole,
  }

  const isReady = checks.supabasePublicConfigPresent && checks.supabasePublicConfigValid

  return NextResponse.json(
    {
      status: isReady ? "ok" : "degraded",
      mode,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: isReady ? 200 : 503 },
  )
}
