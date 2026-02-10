"use client"

import Link from "next/link"
import { Heart, Star, Users, Clock, Trash2 } from "lucide-react"
import { allCourses } from "@/lib/courses-data"
import { usePlatform } from "@/lib/auth-context"

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isEnrolled } = usePlatform()

  const favoriteCourses = allCourses.filter((c) => favorites.includes(c.id))

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Favorites</h1>
        <p className="text-sm text-muted-foreground">
          {favoriteCourses.length > 0
            ? `You have ${favoriteCourses.length} saved course${favoriteCourses.length > 1 ? "s" : ""}`
            : "Your saved courses for later"}
        </p>
      </div>

      {favoriteCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-1 font-heading text-lg font-semibold text-foreground">No favorites yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">Save courses you like and find them here</p>
          <Link
            href="/dashboard/courses"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favoriteCourses.map((course) => {
            const enrolled = isEnrolled(course.id)
            return (
              <div key={course.id} className="group overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md">
                <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${course.color} relative`}>
                  <span className="text-3xl font-bold text-card/90">{course.icon}</span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(course.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm transition-colors hover:bg-destructive/80"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4 text-card" />
                  </button>
                  {enrolled && (
                    <div className="absolute bottom-3 left-3 rounded-lg bg-emerald-500/80 px-2 py-0.5 text-xs font-medium text-card backdrop-blur-sm">
                      Enrolled
                    </div>
                  )}
                </div>
                <Link href={`/dashboard/courses/${course.id}`} className="block p-4">
                  <h3 className="mb-1 font-heading text-sm font-semibold text-foreground group-hover:text-primary">{course.title}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{course.instructor}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-heading text-sm font-bold text-foreground">${course.price}</span>
                    <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{course.level}</span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
