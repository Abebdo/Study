"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Layers, Globe, User, Mail, Lock, AlertCircle } from "lucide-react"
import { hasActiveSession, signUpWithEmail, signUpWithGoogle } from "@/lib/auth-client"

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  React.useEffect(() => {
    hasActiveSession()
      .then((sessionActive) => {
        if (sessionActive) router.push("/dashboard")
      })
      .catch(() => undefined)
  }, [router])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim()) { setError("Please enter your name."); return }
    if (!email.trim()) { setError("Please enter your email."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    setIsLoading(true)

    const result = await signUpWithEmail({
      fullName: name.trim(),
      email: email.trim(),
      password,
      role,
    })

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    if (result.requiresEmailConfirmation) {
      setError("Check your email to confirm your account before signing in.")
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setIsLoading(true)
    const result = await signUpWithGoogle()
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="relative flex w-full max-w-5xl flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
        {/* Left - Illustration */}
        <div className="relative hidden h-[600px] w-full max-w-lg md:block">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Main purple shape */}
            <div className="absolute bottom-20 right-10 z-0 h-64 w-full rotate-6 -skew-x-12 rounded-[3rem] bg-secondary opacity-90 shadow-2xl" />

            {/* Yellow character */}
            <div className="absolute right-0 top-20 z-10 flex h-48 w-32 rotate-12 items-center justify-center rounded-full bg-yellow-400 shadow-lg">
              <div className="relative h-full w-full">
                <div className="absolute left-4 top-10 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-foreground bg-card">
                  <div className="h-2 w-2 -translate-x-1 rounded-full bg-foreground" />
                </div>
                <div className="absolute right-8 top-10 z-20 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-foreground bg-card">
                  <div className="h-2 w-2 -translate-x-1 rounded-full bg-foreground" />
                </div>
              </div>
            </div>

            {/* White ghost character */}
            <div className="absolute right-36 top-40 z-20 flex h-40 w-32 -rotate-3 flex-col items-center rounded-b-3xl rounded-t-full bg-card pt-10 shadow-xl">
              <div className="flex gap-4">
                <div className="h-3 w-3 rounded-full bg-foreground" />
                <div className="h-3 w-3 rounded-full bg-foreground" />
              </div>
              <div className="mt-2 h-2 w-4 rounded-full border-b-2 border-foreground" />
              <div className="absolute bottom-0 flex w-full justify-between px-2 pb-2">
                <div className="-mb-3 h-6 w-6 rounded-full bg-card" />
                <div className="-mb-3 h-6 w-6 rounded-full bg-card" />
                <div className="-mb-3 h-6 w-6 rounded-full bg-card" />
              </div>
            </div>

            {/* Card shape */}
            <div className="absolute left-0 top-10 z-0 h-64 w-64 -rotate-6 rounded-3xl border-4 border-secondary/20 bg-card shadow-lg">
              <div className="space-y-4 p-4 opacity-50">
                <div className="h-12 w-12 rounded-full border-4 border-pink-200" />
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
              </div>
            </div>

            {/* Small decorative shapes */}
            <div className="absolute bottom-32 left-10 z-30 h-12 w-12 -rotate-45 rounded-lg bg-primary shadow-lg" />
            <div className="absolute right-[-20px] top-60 z-30 h-10 w-10 rotate-12 rounded-lg bg-pink-400 shadow-lg" />
            <div className="absolute bottom-10 left-32 z-30 h-8 w-8 rounded-full bg-yellow-300 shadow-md" />
            <div className="absolute left-10 top-80 z-10 flex h-16 w-16 items-center justify-center rounded-full bg-pink-200 shadow-inner">
              <div className="h-6 w-10 -translate-y-2 rounded-lg bg-primary shadow-lg" />
            </div>
          </div>
        </div>

        {/* Right Card - Form */}
        <div className="relative z-10 w-full max-w-md rounded-3xl bg-card p-8 shadow-xl md:p-12">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-300 to-secondary shadow-sm">
                <Layers className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">EduPlatform</span>
            </div>
            <div className="text-right text-xs">
              <p className="text-muted-foreground">Have an account?</p>
              <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-8 text-4xl font-bold text-foreground">Sign up</h1>

          {/* Social Buttons */}
          <div className="mb-8 flex gap-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 font-medium text-secondary-foreground shadow-md shadow-secondary/30 transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
              </svg>
              Sign up with Google
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-500 transition-colors hover:bg-pink-200"
            >
              <Globe className="h-5 w-5" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-muted-foreground">I am a:</p>
            <div className="flex gap-3">
              {([
                { value: "student" as const, label: "Student", desc: "Learn new skills" },
                { value: "teacher" as const, label: "Teacher", desc: "Create courses" },
              ]).map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 text-sm transition-all ${role === r.value ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  <span className="font-semibold">{r.label}</span>
                  <span className="text-[10px]">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border-2 border-blue-200 bg-card py-3 pl-10 pr-4 text-foreground outline-none transition-colors focus:border-primary focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full rounded-xl border-2 border-blue-200 bg-card py-3 pl-10 pr-4 text-foreground outline-none transition-colors focus:border-primary focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-transparent bg-muted py-3 pl-10 pr-10 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-xl bg-foreground px-10 py-3 font-semibold text-card shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-secondary hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-secondary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
