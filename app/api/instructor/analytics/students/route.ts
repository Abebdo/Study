import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/server/auth"

export async function GET() {
  try {
    const auth = await requireAuth(["instructor", "admin"])
    const supabase = createAdminClient()

    let coursesQuery = supabase.from("courses").select("id")
    if (auth.role === "instructor") {
      coursesQuery = coursesQuery.eq("instructor_id", auth.userId)
    }

    const { data: courses, error: coursesError } = await coursesQuery
    if (coursesError) {
      return NextResponse.json({ error: coursesError.message }, { status: 400 })
    }

    const courseIds = (courses ?? []).map(c => c.id)
    if (!courseIds.length) {
      return NextResponse.json({ stats: { enrolledStudents: 0, activeEnrollments: 0, avgProgress: 0 } })
    }

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("user_id, status")
      .in("course_id", courseIds)

    if (enrollmentsError) {
      return NextResponse.json({ error: enrollmentsError.message }, { status: 400 })
    }

    const { data: progressRows, error: progressError } = await supabase
      .from("progress")
      .select("user_id, course_id, completed")
      .in("course_id", courseIds)

    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 400 })
    }

    const uniqueStudents = new Set((enrollments ?? []).map(row => row.user_id))
    const activeEnrollments = (enrollments ?? []).filter(row => row.status === "active").length

    const completedByPair = new Map<string, number>()
    for (const row of progressRows ?? []) {
      if (!row.completed) continue
      const key = `${row.user_id}:${row.course_id}`
      completedByPair.set(key, (completedByPair.get(key) ?? 0) + 1)
    }

    const avgProgress = completedByPair.size
      ? Math.round(
          (Array.from(completedByPair.values()).reduce((sum, count) => sum + count, 0) /
            completedByPair.size) *
            100,
        ) / 100
      : 0

    return NextResponse.json({
      stats: {
        enrolledStudents: uniqueStudents.size,
        activeEnrollments,
        avgProgress,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SUPABASE_ADMIN_NOT_CONFIGURED") {
        return NextResponse.json({ error: "Supabase admin is not configured" }, { status: 500 })
      }
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.json({ error: "Failed to load student analytics" }, { status: 500 })
  }
}
