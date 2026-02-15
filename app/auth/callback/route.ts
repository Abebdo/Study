import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  const safeNext = next.startsWith("/") ? next : "/dashboard"
  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url))
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "recovery" | "email" | "invite" | "magiclink" | "email_change",
    })

    if (!error) {
      const redirectPath = type === "recovery" ? "/reset-password" : safeNext
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=auth_callback_failed", request.url))
}
