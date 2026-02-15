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

async function finalizeAuthenticatedRedirect({
  request,
  supabase,
  next,
}: {
  request: NextRequest
  supabase: Awaited<ReturnType<typeof createClient>>
  next: string
}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    console.warn("[auth/callback] session missing after auth exchange", {
      hasSession: Boolean(session),
      error: sessionError?.message,
    })
    return NextResponse.redirect(new URL("/sign-in?error=auth_session_missing", request.url))
  }

  console.info("[auth/callback] session exists", { userId: session.user.id })

  let profileCreated = false
  try {
    const result = await ensureProfileForUser(session.user)
    profileCreated = result.created
    console.info("[auth/callback] profile ensured", {
      userId: session.user.id,
      created: result.created,
      role: result.profile.role,
    })
  } catch (error) {
    console.error("[auth/callback] profile ensure failed", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : "unknown",
    })
  }

  const role = await resolveRole(supabase, session.user.id, session.user.user_metadata?.role)
  const redirectPath = next === "/dashboard" ? roleHome(role) : next
  console.info("[auth/callback] redirecting authenticated user", {
    userId: session.user.id,
    profileCreated,
    redirectPath,
  })
  return NextResponse.redirect(new URL(redirectPath, request.url))
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
      return finalizeAuthenticatedRedirect({ request, supabase, next })
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

      return finalizeAuthenticatedRedirect({ request, supabase, next })
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=auth_callback_failed", request.url))
}
