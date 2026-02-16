import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/server/auth"

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const params = querySchema.parse({
      date: request.nextUrl.searchParams.get("date") ?? undefined,
    })

    const date = params.date ?? new Date().toISOString().slice(0, 10)
    const dayStart = `${date}T00:00:00.000Z`
    const dayEnd = `${date}T23:59:59.999Z`

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("progress")
      .select("lesson_id, course_id, watched_seconds, completed, updated_at")
      .eq("user_id", auth.userId)
      .gte("updated_at", dayStart)
      .lte("updated_at", dayEnd)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const progressRows = data ?? []
    const lessonsCompleted = progressRows.filter((row) => row.completed).length
    const totalTimeSpentSeconds = progressRows.reduce((sum, row) => sum + (row.watched_seconds ?? 0), 0)
    const coursesAccessed = new Set(progressRows.map((row) => row.course_id)).size
    const lastActivityTime = progressRows
      .map((row) => row.updated_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null

    return NextResponse.json({
      success: true,
      date,
      data: {
        lessonsCompleted,
        quizzesCompleted: 0,
        tasksCompleted: 0,
        totalTimeSpentSeconds,
        coursesAccessed,
        lastActivityTime,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 })
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch daily progress" }, { status: 500 })
  }
}
