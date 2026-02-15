import { createClient } from "@/lib/supabase/client"

type AuthResult = { error?: string }

function callbackUrl(path: string) {
  return `${window.location.origin}${path}`
}

export async function hasActiveSession() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) return false
  return Boolean(data.session)
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? { error: error.message } : {}
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl("/auth/callback?next=/dashboard"),
    },
  })

  return error ? { error: error.message } : {}
}

export async function signUpWithEmail(params: {
  fullName: string
  email: string
  password: string
  role: "student" | "instructor"
}): Promise<{ error?: string; requiresEmailConfirmation?: boolean }> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      emailRedirectTo: callbackUrl("/auth/callback?next=/dashboard"),
      data: {
        full_name: params.fullName,
        role: params.role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { requiresEmailConfirmation: !data.session }
}

export async function signUpWithGoogle(): Promise<AuthResult> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl("/auth/callback?next=/dashboard"),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  return error ? { error: error.message } : {}
}
