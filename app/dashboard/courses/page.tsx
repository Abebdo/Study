"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search,
  Star,
  Users,
  Clock,
  Heart,
  SlidersHorizontal,
  BookOpen,
  CheckCircle2,
} from "lucide-react"
import {
  allCourses,
  categories,
  levels,
  type Course,
} from "@/lib/courses-data"
import { cn } from "@/lib/utils"
import { usePlatform } from "@/lib/auth-context"

export default function CoursesPage() {
  const { isFavorite, toggleFavorite, isEnrolled, getCourseProgress } = usePlatform()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const filteredCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory
    const matchesLevel =
      selectedLevel === "All" || course.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Browse Courses
        </h1>
        <p className="text-sm text-muted-foreground">
          Discover {allCourses.length}+ courses from top instructors
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses, topics, instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            showFilters
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground shadow-sm hover:bg-muted"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Filter Pills */}
      {showFilters && (
        <div className="mb-6 space-y-4 rounded-2xl bg-card p-5 shadow-sm">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-border hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Level
            </p>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedLevel === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-border hover:text-foreground"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}{" "}
        found
      </p>

      {/* Course Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isFav={isFavorite(course.id)}
            onToggleFavorite={() => toggleFavorite(course.id)}
            enrolled={isEnrolled(course.id)}
            progress={getCourseProgress(course.id)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">
            No courses found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  )
}

function CourseCard({
  course,
  isFav,
  onToggleFavorite,
  enrolled,
  progress,
}: {
  course: Course
  isFav: boolean
  onToggleFavorite: () => void
  enrolled: boolean
  progress: number
}) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md">
      {/* Top color bar */}
      <div
        className={`flex h-28 items-center justify-center bg-gradient-to-br ${course.color} relative`}
      >
        <span className="text-3xl font-bold text-card/90">{course.icon}</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite()
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm transition-colors hover:bg-card/40"
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              isFav ? "fill-card text-card" : "text-card"
            )}
          />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="rounded-lg bg-card/20 px-2 py-0.5 text-xs font-medium text-card backdrop-blur-sm">
            {course.level}
          </span>
          {enrolled && (
            <span className="flex items-center gap-1 rounded-lg bg-emerald-500/80 px-2 py-0.5 text-xs font-medium text-card backdrop-blur-sm">
              <CheckCircle2 className="h-3 w-3" />
              Enrolled
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <Link href={`/dashboard/courses/${course.id}`} className="block p-4">
        <h3 className="mb-1 font-heading text-sm font-semibold text-foreground group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {course.description}
        </p>

        {/* Progress bar for enrolled courses */}
        {enrolled && progress > 0 && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {course.students.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.lessons}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {course.instructor[0]}
            </div>
            <span className="text-xs text-muted-foreground">
              {course.instructor}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {enrolled ? (
              <span className="text-xs font-medium text-emerald-600">Continue</span>
            ) : (
              <>
                <span className="font-heading text-sm font-bold text-foreground">
                  ${course.price}
                </span>
                {course.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${course.originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
