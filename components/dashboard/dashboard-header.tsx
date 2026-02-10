"use client"

import { Bell, Search, X, BookOpen, Radio, Users } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePlatform } from "@/lib/auth-context"
import { allCourses } from "@/lib/courses-data"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const { currentUser, unreadNotificationCount } = usePlatform()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<typeof allCourses>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const q = query.toLowerCase()
    // Smart search: understand intent
    const filtered = allCourses.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q)
    ).slice(0, 5)
    setResults(filtered)
  }, [query])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {greeting()}, {currentUser?.name.split(" ")[0] || "User"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {currentUser?.streak ? `${currentUser.streak}-day streak! ` : ""}
          Here is your learning summary.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Smart Search */}
        <div className="relative">
          {searchOpen ? (
            <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, topics, instructors..."
                className="w-40 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-64"
              />
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setQuery(""); setResults([]) }}
                aria-label="Close search"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* Search Results Dropdown */}
          {searchOpen && results.length > 0 && (
            <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-card shadow-xl">
              <div className="p-2">
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Courses</p>
                {results.map((course) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/courses/${course.id}`}
                    onClick={() => { setSearchOpen(false); setQuery(""); setResults([]) }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${course.color}`}>
                      <span className="text-xs font-bold text-card">{course.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{course.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{course.instructor} - {course.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/dashboard/courses"
                onClick={() => { setSearchOpen(false); setQuery(""); setResults([]) }}
                className="flex items-center justify-center border-t border-border py-2.5 text-xs font-medium text-primary hover:bg-muted"
              >
                View all courses
              </Link>
            </div>
          )}

          {searchOpen && query.trim() && results.length === 0 && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl bg-card p-6 text-center shadow-xl">
              <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No results found</p>
              <p className="text-xs text-muted-foreground">Try different keywords</p>
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
              {unreadNotificationCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  )
}
