import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ensureProfileForUser } from "@/lib/server/profiles"
import { normalizeRole } from "@/lib/auth/roles"

function getSafeNext(next: string | null) {
  if (!next || !next.startsWith("/")) return "/dashboard"
  return next
}

function roleHome(role: ReturnType<typeof normalizeRole>) {
  if (role === "teacher") return "/dashboard/teacher"
  return "/dashboard"
}

async function resolveRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, roleFromMetadata: unknown) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  return normalizeRole(profile?.role ?? roleFromMetadata)
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = getSafeNext(requestUrl.searchParams.get("next"))

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await ensureProfileForUser(user)
        const role = await resolveRole(supabase, user.id, user.user_metadata?.role)
        const redirectPath = next === "/dashboard" ? roleHome(role) : next
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "recovery" | "email" | "invite" | "magiclink" | "email_change",
    })

    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/reset-password", request.url))
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await ensureProfileForUser(user)
        const role = await resolveRole(supabase, user.id, user.user_metadata?.role)
        const redirectPath = next === "/dashboard" ? roleHome(role) : next
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }

      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=auth_callback_failed", request.url))
}
