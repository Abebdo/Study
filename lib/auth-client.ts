import { createClient } from "@/lib/supabase/client"

type AuthResult = { error?: string }

function callbackUrl(path: string) {
  return `${window.location.origin}${path}`
}

function mapAuthError(error: unknown) {
  if (!(error instanceof Error)) return "Authentication failed. Please try again."

  if (error.message === "SUPABASE_NOT_CONFIGURED") {
    return "Authentication is not configured. Missing Supabase environment variables."
  }

  if (error.message === "SUPABASE_INVALID_PUBLIC_CONFIG") {
    return "Invalid Supabase URL or API key. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  }

  if (error.message.toLowerCase().includes("provider") && error.message.toLowerCase().includes("disabled")) {
    return "Google provider is not enabled in Supabase Auth settings."
  }

  return error.message
}

export async function hasActiveSession() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()
    if (error) return false
    return Boolean(data.session)
  } catch {
    return false
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: mapAuthError(error) } : {}
  } catch (error) {
    return { error: mapAuthError(error) }
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl("/auth/callback?next=/dashboard"),
      },
    })

    return error ? { error: mapAuthError(error) } : {}
  } catch (error) {
    return { error: mapAuthError(error) }
  }
}

export async function signUpWithEmail(params: {
  fullName: string
  email: string
  password: string
  role: "student" | "teacher"
}): Promise<{ error?: string; requiresEmailConfirmation?: boolean }> {
  try {
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
      return { error: mapAuthError(error) }
    }

    return { requiresEmailConfirmation: !data.session }
  } catch (error) {
    return { error: mapAuthError(error) }
  }
}

export async function signUpWithGoogle(): Promise<AuthResult> {
  try {
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

    return error ? { error: mapAuthError(error) } : {}
  } catch (error) {
    return { error: mapAuthError(error) }
  }
}
