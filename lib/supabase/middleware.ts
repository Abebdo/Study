import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const role = normalizeRole(profile?.role ?? user.user_metadata?.role)

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
