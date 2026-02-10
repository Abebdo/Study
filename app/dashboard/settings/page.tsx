"use client"

import { useState } from "react"
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Moon,
  Eye,
  EyeOff,
  Camera,
  Save,
  Shield,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "profile" | "notifications" | "security" | "billing"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [showPassword, setShowPassword] = useState(false)

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
    { id: "security" as Tab, label: "Security", icon: Shield },
    { id: "billing" as Tab, label: "Billing", icon: CreditCard },
  ]

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Settings Nav */}
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

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-6 font-heading text-lg font-semibold text-foreground">
                  Profile Information
                </h2>

                {/* Avatar */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-2xl font-bold text-card">
                      RR
                    </div>
                    <button
                      type="button"
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
                      aria-label="Change avatar"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <p className="font-heading text-lg font-semibold text-foreground">
                      Ronald Richards
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Premium Member
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="firstName"
                        type="text"
                        defaultValue="Ronald"
                        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="lastName"
                        type="text"
                        defaultValue="Richards"
                        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        defaultValue="ron.richards@gmail.com"
                        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="bio"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={3}
                      defaultValue="Passionate learner exploring web development and data science."
                      className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="language"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      Language
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        id="language"
                        className="w-full appearance-none rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option>English</option>
                        <option>Arabic</option>
                        <option>French</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="theme"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      Theme
                    </label>
                    <div className="relative">
                      <Moon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        id="theme"
                        className="w-full appearance-none rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      >
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h2 className="mb-6 font-heading text-lg font-semibold text-foreground">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "Course Updates",
                    desc: "Get notified when enrolled courses have new content",
                    default: true,
                  },
                  {
                    title: "Assignment Reminders",
                    desc: "Reminders for upcoming assignments and quizzes",
                    default: true,
                  },
                  {
                    title: "Messages",
                    desc: "Notifications for new messages from instructors",
                    default: true,
                  },
                  {
                    title: "Promotional Emails",
                    desc: "Receive offers and discounts on new courses",
                    default: false,
                  },
                  {
                    title: "Weekly Progress Report",
                    desc: "Summary of your weekly learning activity",
                    default: true,
                  },
                  {
                    title: "Achievement Badges",
                    desc: "Get notified when you earn new achievements",
                    default: true,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between rounded-xl border border-border p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        defaultChecked={item.default}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-card after:shadow-sm after:transition-all peer-checked:bg-secondary peer-checked:after:translate-x-5 peer-focus:outline-none" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-6 font-heading text-lg font-semibold text-foreground">
                  Change Password
                </h2>
                <div className="max-w-md space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="currentPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-1.5 block text-sm font-medium text-muted-foreground"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Save className="h-4 w-4" />
                    Update Password
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Two-Factor Authentication
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Add an extra layer of security to your account by enabling
                  two-factor authentication.
                </p>
                <button
                  type="button"
                  className="rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Current Plan
                </h2>
                <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-secondary/5 p-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Premium Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Unlimited access to all courses
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Next billing: March 15, 2026
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-2xl font-bold text-foreground">
                      $19.99
                    </p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                  Payment Method
                </h2>
                <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                  <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Visa ending in 4242
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires 12/2027
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-secondary hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
