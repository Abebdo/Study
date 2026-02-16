"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  PlayCircle,
  Target,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/lib/auth-context"
import { allCourses, courseDetails } from "@/lib/courses-data"

type Tab = "in-progress" | "completed"

const WEEK_DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function MyLearningPage() {
  const { currentUser, enrollments, achievements } = usePlatform()
  const [activeTab, setActiveTab] = useState<Tab>("in-progress")

  const learningInsights = useMemo(() => {
    const now = new Date()
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)

    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const hoursByDay = Array.from({ length: 7 }, (_, index) => ({
      day: WEEK_DAY_LABELS[index],
      hours: 0,
    }))

    let totalSeconds = 0
    let todaySeconds = 0
    const activeThisWeek = new Set<number>()

    for (const enrollment of enrollments) {
      const watchedSeconds = Object.values(enrollment.watchTimes ?? {}).reduce((sum, value) => sum + value, 0)
      totalSeconds += watchedSeconds

      const lastAccess = new Date(enrollment.lastAccessedAt)
      if (!Number.isNaN(lastAccess.getTime()) && lastAccess >= weekStart) {
        const dayIndex = lastAccess.getDay()
        hoursByDay[dayIndex].hours += watchedSeconds / 3600
        activeThisWeek.add(enrollment.courseId)
      }

      if (!Number.isNaN(lastAccess.getTime()) && lastAccess >= dayStart) {
        todaySeconds += watchedSeconds
      }
    }

    return {
      weeklyActivity: hoursByDay.map((item) => ({ ...item, hours: Number(item.hours.toFixed(1)) })),
      totalHoursLearned: Number((totalSeconds / 3600).toFixed(1)),
      todayHours: Number((todaySeconds / 3600).toFixed(1)),
      weeklyCourses: activeThisWeek.size,
    }
  }, [enrollments])

  const enrolledWithCourses = enrollments.map((e) => {
    const course = allCourses.find((c) => c.id === e.courseId)
    const detail = courseDetails[e.courseId]
    const totalLessons = detail?.modules.reduce((a, m) => a + m.lessons.length, 0) || 0
    // Find next lesson title
    let nextLesson = ""
    if (detail) {
      for (const mod of detail.modules) {
        for (const lesson of mod.lessons) {
          if (!e.completedLessons.includes(lesson.id)) {
            nextLesson = lesson.title
            break
          }
        }
        if (nextLesson) break
      }
    }
    return { ...e, course, detail, totalLessons, nextLesson }
  }).filter((e) => e.course)

  const inProgress = enrolledWithCourses.filter((e) => e.progress < 100)
  const completed = enrolledWithCourses.filter((e) => e.progress >= 100)

  const stats = [
    { label: "Hours Learned", value: String(learningInsights.totalHoursLearned || currentUser?.totalHoursLearned || 0), icon: Clock, color: "bg-blue-100 text-blue-600" },
    { label: "Courses Active", value: String(inProgress.length), icon: BookOpen, color: "bg-amber-100 text-amber-600" },
    { label: "Certificates", value: String(completed.length), icon: Award, color: "bg-emerald-100 text-emerald-600" },
    { label: "Day Streak", value: String(currentUser?.streak || 0), icon: Flame, color: "bg-red-100 text-red-600" },
  ]

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">My Learning</h1>
        <p className="text-sm text-muted-foreground">Track your progress and keep learning</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          {/* Weekly Activity */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-foreground">Weekly Activity</h2>
              <div className="flex items-center gap-1 text-sm text-emerald-500">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">+15% from last week</span>
              </div>
            </div>
            <div className="flex items-end gap-3">
              {learningInsights.weeklyActivity.map((day) => {
                const maxHours = 4
                const height = (day.hours / maxHours) * 120
                return (
                  <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{day.hours}h</span>
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-secondary to-accent transition-all"
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("in-progress")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                activeTab === "in-progress"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              In Progress ({inProgress.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={cn(
                "pb-3 text-sm font-medium transition-colors",
                activeTab === "completed"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Completed ({completed.length})
            </button>
          </div>

          {/* Course List */}
          {activeTab === "in-progress" && (
            <div className="space-y-4">
              {inProgress.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">No courses in progress</p>
                  <Link href="/dashboard/courses" className="mt-2 text-sm text-primary hover:underline">Browse courses</Link>
                </div>
              ) : (
                inProgress.map((item) => (
                  <Link
                    key={item.courseId}
                    href={`/dashboard/courses/${item.courseId}`}
                    className="group flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.course!.color}`}>
                      <span className="text-lg font-bold text-card">{item.course!.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-foreground group-hover:text-primary">{item.course!.title}</h3>
                      <p className="mb-2 text-xs text-muted-foreground">{item.course!.instructor}</p>
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent" style={{ width: `${item.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{item.progress}%</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.completedLessons.length}/{item.totalLessons} lessons
                      </p>
                    </div>
                    {item.nextLesson && (
                      <div className="hidden flex-shrink-0 flex-col items-end gap-2 sm:flex">
                        <div className="flex items-center gap-1 text-xs text-secondary">
                          <PlayCircle className="h-4 w-4" />
                          <span>Next: {item.nextLesson}</span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="space-y-4">
              {completed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Award className="mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">No completed courses yet</p>
                  <p className="text-xs text-muted-foreground">Keep learning to earn your first certificate!</p>
                </div>
              ) : (
                completed.map((item) => (
                  <div key={item.courseId} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
                    <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.course!.color}`}>
                      <span className="text-lg font-bold text-card">{item.course!.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-semibold text-foreground">{item.course!.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.course!.instructor}</p>
                    </div>
                    {item.certificate && (
                      <button type="button" className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
                        <Award className="h-3.5 w-3.5" />
                        Certificate
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Goals */}
        <div className="w-full space-y-6 lg:w-72">
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">Learning Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><Target className="h-3.5 w-3.5" />Daily goal</span>
                  <span className="font-medium text-foreground">{learningInsights.todayHours}h / 2h</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent" style={{ width: `${Math.min((learningInsights.todayHours / 2) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><BookOpen className="h-3.5 w-3.5" />Weekly courses</span>
                  <span className="font-medium text-foreground">{learningInsights.weeklyCourses} / 5</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary" style={{ width: `${Math.min((learningInsights.weeklyCourses / 5) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground"><Flame className="h-3.5 w-3.5" />Monthly streak</span>
                  <span className="font-medium text-foreground">{currentUser?.streak || 0} / 30 days</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent" style={{ width: `${((currentUser?.streak || 0) / 30) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              {achievements.slice(0, 6).map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl p-2",
                    badge.unlockedAt ? "opacity-100" : "opacity-40"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    badge.unlockedAt
                      ? "bg-gradient-to-br from-secondary to-accent"
                      : "bg-muted"
                  )}>
                    <Award className={cn(
                      "h-5 w-5",
                      badge.unlockedAt ? "text-secondary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className="text-center text-[10px] text-muted-foreground">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
