"use client"

import { Search, Plus, Clock, BookOpen, Flame, Award } from "lucide-react"
import { usePlatform } from "@/lib/auth-context"

const classmates = [
  { name: "Jeffrey Clint", hours: 12, courses: 11 },
  { name: "Dianne Mussell", hours: 23, courses: 15 },
  { name: "April Marren", hours: 48, courses: 10 },
  { name: "Sara Malkins", hours: 64, courses: 3 },
  { name: "Jacob Smith", hours: 22, courses: 12 },
]

export function ProfileSidebar() {
  const { currentUser, enrollments, achievements } = usePlatform()

  if (!currentUser) return null

  const activeCourses = enrollments.filter(e => e.progress < 100).length
  const completedCourses = enrollments.filter(e => e.progress >= 100).length
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-2xl bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent">
          <span className="text-2xl font-bold text-card">
            {currentUser.name.split(" ").map(n => n[0]).join("")}
          </span>
        </div>
        {currentUser.isPremium && (
          <div className="mb-1 inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
            Premium Plan
          </div>
        )}
        <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">
          {currentUser.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {currentUser.email}
        </p>

        <div className="mt-4 flex justify-center gap-4">
          <div className="text-center">
            <p className="font-heading text-2xl font-bold text-foreground">{currentUser.totalHoursLearned}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Hours
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="font-heading text-2xl font-bold text-foreground">{enrollments.length}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" /> Courses
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="font-heading text-2xl font-bold text-foreground">{currentUser.streak}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3 w-3" /> Streak
            </p>
          </div>
        </div>

        {/* Mini Achievement Row */}
        <div className="mt-4 flex items-center justify-center gap-1">
          {achievements.filter(a => a.unlockedAt).slice(0, 4).map((a) => (
            <div key={a.id} className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-secondary/20 to-accent/20" title={a.label}>
              <Award className="h-3.5 w-3.5 text-secondary" />
            </div>
          ))}
          {unlockedAchievements > 4 && (
            <span className="text-xs text-muted-foreground">+{unlockedAchievements - 4}</span>
          )}
        </div>
      </div>

      {/* Classmates / Friends */}
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Classmates
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">138</span>
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
              aria-label="Add classmate"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ..."
            className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {classmates.map((person) => (
            <div
              key={person.name}
              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                {person.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {person.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {person.hours}h - {person.courses} courses
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
