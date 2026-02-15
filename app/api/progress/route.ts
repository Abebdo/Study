import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/server/auth"

const upsertSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  videoId: z.string().uuid().nullable().optional(),
  watchedSeconds: z.number().int().min(0),
  completed: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const courseId = request.nextUrl.searchParams.get("courseId")
    const supabase = await createClient()

    let query = supabase
      .from("progress")
      .select("id, user_id, course_id, lesson_id, video_id, watched_seconds, completed, updated_at")
      .eq("user_id", auth.userId)
      .order("updated_at", { ascending: false })

    if (courseId) {
      query = query.eq("course_id", courseId)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ progress: data ?? [] })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["student", "admin"])
    const payload = upsertSchema.parse(await request.json())
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("upsert_lesson_progress", {
      p_course_id: payload.courseId,
      p_lesson_id: payload.lessonId,
      p_video_id: payload.videoId ?? null,
      p_watched_seconds: payload.watchedSeconds,
      p_completed: payload.completed,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ progressId: data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 })
    }
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
