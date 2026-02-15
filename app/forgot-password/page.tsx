"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setMessage("If the email exists, a reset link was sent. Check your inbox.")
      }
    } catch {
      setError("Unable to send reset email right now. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Forgot password</h1>
        <p className="mb-6 text-sm text-muted-foreground">Enter your email to receive a secure reset link.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-input bg-background px-3 py-2"
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60"
          >
            {isLoading ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
