"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  BookOpen,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  Radio,
  Bell,
  LayoutDashboard,
  User,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/lib/auth-context"

const studentNav = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: BookOpen, label: "Courses", href: "/dashboard/courses" },
  { icon: BarChart3, label: "My Learning", href: "/dashboard/my-learning" },
  { icon: Radio, label: "Live Sessions", href: "/dashboard/live" },
  { icon: Heart, label: "Favorites", href: "/dashboard/favorites" },
  { icon: MessageSquare, label: "Chats", href: "/dashboard/chats" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
]

const teacherNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/teacher" },
  { icon: Radio, label: "Go Live", href: "/dashboard/teacher/live" },
]

const adminNav = [
  { icon: Shield, label: "Admin Panel", href: "/dashboard/admin" },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { currentUser, logout, unreadNotificationCount, totalUnreadMessages, isTeacher, isAdmin } = usePlatform()

  return (
    <aside className="sticky top-0 flex h-screen w-20 flex-col items-center justify-between bg-card py-6 lg:w-64 lg:items-start lg:px-5">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          <GraduationCap className="h-5 w-5 text-secondary-foreground" />
        </div>
        <span className="hidden font-heading text-lg font-bold text-foreground lg:block">
          EduPlatform
        </span>
      </div>

      {/* User Info */}
      {currentUser && (
        <div className="mt-4 w-full px-1">
          <div className="hidden items-center gap-3 rounded-xl bg-muted px-3 py-2.5 lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-xs font-bold text-card">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{currentUser.name}</p>
              <p className="truncate text-[10px] capitalize text-muted-foreground">{currentUser.role}{currentUser.isPremium ? " - Premium" : ""}</p>
            </div>
          </div>
          <div className="flex justify-center lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-xs font-bold text-card">
              {currentUser.name.split(" ").map(n => n[0]).join("")}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-0.5 overflow-y-auto py-4 lg:w-full lg:items-stretch">
        {/* Student Navigation */}
        {studentNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const badge = item.label === "Notifications" ? unreadNotificationCount :
            item.label === "Chats" ? totalUnreadMessages : 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all lg:justify-start",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
              {badge > 0 && (
                <span className={cn(
                  "ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold lg:flex",
                  isActive ? "bg-card/20 text-primary-foreground" : "bg-accent text-accent-foreground"
                )}>{badge}</span>
              )}
            </Link>
          )
        })}

        {/* Teacher Section Divider */}
        {(isTeacher || isAdmin) && (
          <>
            <div className="my-2 hidden items-center gap-2 px-3 lg:flex">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Teacher</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="my-1 flex justify-center lg:hidden">
              <div className="h-px w-8 bg-border" />
            </div>
            {teacherNav.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard/teacher/live")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all lg:justify-start",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              )
            })}
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="my-2 hidden items-center gap-2 px-3 lg:flex">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Admin</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {adminNav.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all lg:justify-start",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={() => {
          logout()
          window.location.href = "/sign-in"
        }}
        className="flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive lg:w-full lg:justify-start"
      >
        <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
        <span className="hidden lg:block">Log out</span>
      </button>
    </aside>
  )
}
