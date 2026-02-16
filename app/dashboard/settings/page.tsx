"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, CreditCard, Save, Shield, User, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/lib/auth-context"

type Tab = "profile" | "notifications" | "security" | "billing"

type HealthResponse = {
  status: "ok" | "degraded"
  mode: "demo" | "production"
  checks: {
    supabasePublicConfigPresent: boolean
    supabasePublicConfigValid: boolean
    supabaseServiceRolePresent: boolean
  }
  timestamp: string
}

export default function SettingsPage() {
  const { currentUser, updateUser } = usePlatform()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [saveMessage, setSaveMessage] = useState("")

  const [fullName, setFullName] = useState(currentUser?.name ?? "")
  const [bio, setBio] = useState(currentUser?.bio ?? "")
  const [language, setLanguage] = useState(currentUser?.settings.language ?? "English")
  const [theme, setTheme] = useState<"light" | "dark" | "system">(currentUser?.settings.theme ?? "light")

  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState("")

  useEffect(() => {
    setFullName(currentUser?.name ?? "")
    setBio(currentUser?.bio ?? "")
    setLanguage(currentUser?.settings.language ?? "English")
    setTheme(currentUser?.settings.theme ?? "light")
  }, [currentUser])

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" })
        const data = (await response.json()) as HealthResponse
        setHealth(data)
      } catch {
        setHealthError("Unable to fetch health diagnostics.")
      }
    }

    void loadHealth()
  }, [])

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
    { id: "security" as Tab, label: "Security", icon: Shield },
    { id: "billing" as Tab, label: "Billing", icon: CreditCard },
  ]

  const initials = useMemo(() => {
    if (!fullName.trim()) return "U"
    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("")
  }, [fullName])

  const saveProfile = () => {
    if (!fullName.trim()) {
      setSaveMessage("Name is required.")
      return
    }

    if (!currentUser) {
      setSaveMessage("No active user session.")
      return
    }

    updateUser({
      name: fullName.trim(),
      bio: bio.trim(),
      settings: {
        ...currentUser.settings,
        language,
        theme,
      },
    })

    setSaveMessage("Profile updated successfully.")
    setTimeout(() => setSaveMessage(""), 2500)
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and platform diagnostics</p>
      </div>

      <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Platform Health</h2>
        </div>
        {healthError ? (
          <p className="text-xs text-destructive">{healthError}</p>
        ) : health ? (
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <p>Status: <span className={cn("font-semibold", health.status === "ok" ? "text-emerald-600" : "text-amber-600")}>{health.status}</span></p>
            <p>Mode: <span className="font-semibold text-foreground">{health.mode}</span></p>
            <p>Supabase config: <span className="font-semibold text-foreground">{health.checks.supabasePublicConfigValid ? "valid" : "invalid"}</span></p>
            <p>Service key: <span className="font-semibold text-foreground">{health.checks.supabaseServiceRolePresent ? "present" : "missing"}</span></p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Loading health checks...</p>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full lg:w-56">
          <nav className="flex gap-1 lg:flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="space-y-6 rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="font-heading text-lg font-semibold text-foreground">Profile Information</h2>

              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-2xl font-bold text-card">
                  {initials}
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">{fullName || "Unnamed user"}</p>
                  <p className="text-sm text-muted-foreground">{currentUser?.email || "No email"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-muted-foreground">Full Name</label>
                  <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="mb-1.5 block text-sm font-medium text-muted-foreground">Bio</label>
                  <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label htmlFor="language" className="mb-1.5 block text-sm font-medium text-muted-foreground">Language</label>
                  <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    <option>English</option>
                    <option>Arabic</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="theme" className="mb-1.5 block text-sm font-medium text-muted-foreground">Theme</label>
                  <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>

              <button type="button" onClick={saveProfile} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              {saveMessage && <p className="text-xs text-muted-foreground">{saveMessage}</p>}
            </div>
          )}

          {activeTab !== "profile" && (
            <div className="rounded-2xl bg-card p-6 text-sm text-muted-foreground shadow-sm">
              This section is available in UI and will be connected to backend policies/checkout flows next.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
