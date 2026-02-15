import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"
import { getSupabasePublicConfig } from "@/lib/supabase/config"
import { normalizeRole } from "@/lib/auth/roles"

type CookieToSet = {
  name: string
  value: string
  options?: CookieOptions
}

function homeByRole(role: ReturnType<typeof normalizeRole>) {
  if (role === "teacher") return "/dashboard/teacher"
  return "/dashboard"
}

async function ensureProfileInMiddleware(
  supabase: ReturnType<typeof createServerClient>,
  user: User,
) {
  const payload = {
    id: user.id,
    email: user.email ?? "",
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
    role: normalizeRole(user.user_metadata?.role),
  }

  const existing = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (existing.data) {
    return normalizeRole(existing.data.role)
  }

  const upsertAttempt = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })

  if (upsertAttempt.error) {
    console.warn("[middleware] profile upsert skipped", {
      userId: user.id,
      error: upsertAttempt.error.message,
    })
  } else {
    console.info("[middleware] created missing profile", { userId: user.id })
  }

  return payload.role
}

export async function updateSession(request: NextRequest) {
  const { url, anonKey, isConfigured, isValid } = getSupabasePublicConfig()
  if (!isConfigured || !isValid || !url || !anonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const onAuthPage = path === "/sign-in" || path === "/sign-up"
  const onDashboard = path.startsWith("/dashboard")
  const onTeacherDashboard = path.startsWith("/dashboard/teacher")

  if (onDashboard && !user) {
    const urlRef = request.nextUrl.clone()
    urlRef.pathname = "/sign-in"
    return NextResponse.redirect(urlRef)
  }

  if (!user) {
    return supabaseResponse
  }

  // Session is source of truth. Missing/failed profile lookup should never log users out.
  const role = await ensureProfileInMiddleware(supabase, user)

  if (onAuthPage) {
    const urlRef = request.nextUrl.clone()
    urlRef.pathname = homeByRole(role)
    return NextResponse.redirect(urlRef)
  }

  if (onTeacherDashboard && role === "student") {
    const urlRef = request.nextUrl.clone()
    urlRef.pathname = "/dashboard"
    return NextResponse.redirect(urlRef)
  }

  if (onDashboard && !onTeacherDashboard && role === "teacher") {
    const urlRef = request.nextUrl.clone()
    urlRef.pathname = "/dashboard/teacher"
    return NextResponse.redirect(urlRef)
  }

  return supabaseResponse
}
