"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  BookOpen,
  PlayCircle,
  FileText,
  HelpCircle,
  Code,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  Award,
  Lock,
} from "lucide-react"
import { courseDetails, allCourses } from "@/lib/courses-data"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/lib/auth-context"

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const courseId = Number.parseInt(id)
  const course = courseDetails[courseId]
  const { isEnrolled, getEnrollment, isFavorite, toggleFavorite, completeLesson } = usePlatform()
  const [expandedModules, setExpandedModules] = useState<number[]>([0])

  const enrolled = isEnrolled(courseId)
  const enrollment = getEnrollment(courseId)
  const fav = isFavorite(courseId)

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Course not found
          </h2>
          <Link
            href="/dashboard/courses"
            className="mt-4 inline-flex items-center gap-2 text-sm text-secondary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </div>
      </div>
    )
  }

  const toggleModule = (index: number) => {
    setExpandedModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const totalLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.length, 0
  )
  const completedLessons = enrollment
    ? enrollment.completedLessons.length
    : course.modules.reduce(
        (acc, mod) => acc + mod.lessons.filter((l) => l.completed).length, 0
      )
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const isLessonCompleted = (lessonId: number) => {
    if (enrollment) return enrollment.completedLessons.includes(lessonId)
    return false
  }

  // Sequential lesson locking: only allow access to next uncompleted lesson
  const isLessonUnlocked = (lessonId: number, lessonIndex: number, allLessons: typeof course.modules[0]["lessons"]) => {
    if (!enrolled) return false
    if (lessonIndex === 0) return true
    // Previous lesson must be completed
    const prevLesson = allLessons[lessonIndex - 1]
    return isLessonCompleted(prevLesson.id)
  }

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video": return <PlayCircle className="h-4 w-4" />
      case "quiz": return <HelpCircle className="h-4 w-4" />
      case "exercise": return <Code className="h-4 w-4" />
      case "reading": return <FileText className="h-4 w-4" />
      default: return <PlayCircle className="h-4 w-4" />
    }
  }

  // Find next uncompleted lesson for "Continue Learning" button
  let nextLessonId: number | null = null
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!isLessonCompleted(lesson.id)) {
        nextLessonId = lesson.id
        break
      }
    }
    if (nextLessonId) break
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Back button */}
      <Link
        href="/dashboard/courses"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Course Header Card */}
          <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
            <div
              className={`flex h-40 items-center justify-center bg-gradient-to-br ${course.color} relative`}
            >
              <span className="text-5xl font-bold text-card/80">
                {course.icon}
              </span>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="rounded-lg bg-card/20 px-3 py-1 text-xs font-medium text-card backdrop-blur-sm">
                  {course.level}
                </span>
                <span className="rounded-lg bg-card/20 px-3 py-1 text-xs font-medium text-card backdrop-blur-sm">
                  {course.category}
                </span>
                {enrolled && (
                  <span className="flex items-center gap-1 rounded-lg bg-emerald-500/80 px-3 py-1 text-xs font-medium text-card backdrop-blur-sm">
                    <CheckCircle2 className="h-3 w-3" /> Enrolled
                  </span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  {course.title}
                </h1>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(courseId)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        fav && "fill-accent text-accent"
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {course.longDescription}
              </p>

              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">{course.rating}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.students.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration} total
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Certificate
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {course.instructor[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{course.instructor}</p>
                  <p className="text-xs text-muted-foreground">{course.institution}</p>
                </div>
              </div>
            </div>
          </div>

          {/* What you'll learn */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
              What you will learn
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {course.whatYouLearn.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Content / Modules */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
              Course content
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              {course.modules.length} modules - {totalLessons} lessons - {course.duration} total
            </p>
            <div className="space-y-2">
              {course.modules.map((mod, modIndex) => {
                const isExpanded = expandedModules.includes(modIndex)
                const modCompleted = mod.lessons.filter(
                  (l) => isLessonCompleted(l.id)
                ).length

                // Flatten all previous lessons to check sequential locking
                const allPrevLessons = course.modules
                  .slice(0, modIndex)
                  .flatMap(m => m.lessons)

                return (
                  <div
                    key={mod.title}
                    className="overflow-hidden rounded-xl border border-border"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(modIndex)}
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium text-foreground">
                          {mod.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {modCompleted}/{mod.lessons.length} completed
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border">
                        {mod.lessons.map((lesson, lessonIdx) => {
                          const completed = isLessonCompleted(lesson.id)
                          // Global lesson index for sequential unlocking
                          const globalIdx = allPrevLessons.length + lessonIdx
                          const allLessonsFlat = course.modules.flatMap(m => m.lessons)
                          const unlocked = !enrolled || globalIdx === 0 || isLessonCompleted(allLessonsFlat[globalIdx - 1]?.id)
                          const isCurrent = enrolled && !completed && unlocked

                          return (
                            <div
                              key={lesson.id}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 transition-colors",
                                isCurrent && "bg-primary/5 border-l-2 border-l-primary",
                                !isCurrent && "hover:bg-muted/50"
                              )}
                            >
                              {completed ? (
                                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                              ) : unlocked ? (
                                <Circle className="h-4 w-4 flex-shrink-0 text-primary" />
                              ) : (
                                <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                              )}
                              <span className={cn(
                                "flex items-center gap-2 text-xs",
                                completed ? "text-muted-foreground" : "text-foreground"
                              )}>
                                {lessonIcon(lesson.type)}
                              </span>
                              {enrolled && unlocked ? (
                                <Link
                                  href={`/dashboard/courses/${courseId}/lesson/${lesson.id}`}
                                  className={cn(
                                    "flex-1 text-sm hover:text-primary",
                                    completed ? "text-muted-foreground line-through" : "text-foreground"
                                  )}
                                >
                                  {lesson.title}
                                </Link>
                              ) : (
                                <span className={cn(
                                  "flex-1 text-sm",
                                  completed ? "text-muted-foreground line-through" : !unlocked ? "text-muted-foreground/50" : "text-foreground"
                                )}>
                                  {lesson.title}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80">
          <div className="sticky top-6 space-y-4">
            {/* Price & Enroll Card */}
            {!enrolled ? (
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="font-heading text-3xl font-bold text-foreground">
                    ${course.price}
                  </span>
                  {course.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${course.originalPrice}
                    </span>
                  )}
                </div>
                {course.originalPrice && (
                  <p className="mb-4 text-xs font-medium text-accent">
                    {Math.round(
                      ((course.originalPrice - course.price) / course.originalPrice) * 100
                    )}
                    % off - Limited time offer!
                  </p>
                )}
                <Link
                  href={`/dashboard/checkout/${course.id}`}
                  className="mb-3 flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Enroll Now
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  30-day money-back guarantee
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-card p-6 shadow-sm">
                <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">
                  Your Progress
                </h3>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedLessons} / {totalLessons} lessons
                  </span>
                  <span className="font-semibold text-foreground">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-accent transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {progress >= 100 ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3">
                    <Award className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">Course Completed!</p>
                      <p className="text-xs text-emerald-600">Certificate is available</p>
                    </div>
                  </div>
                ) : nextLessonId ? (
                  <Link
                    href={`/dashboard/courses/${courseId}/lesson/${nextLessonId}`}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-secondary py-3 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
                  >
                    Continue Learning
                  </Link>
                ) : null}
              </div>
            )}

            {/* Course Includes */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">
                This course includes
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PlayCircle className="h-4 w-4 text-secondary" />
                  {course.duration} of video content
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 text-secondary" />
                  {totalLessons} lessons
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code className="h-4 w-4 text-secondary" />
                  Practical exercises
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4 text-secondary" />
                  Certificate of completion
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-secondary" />
                  Lifetime access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
