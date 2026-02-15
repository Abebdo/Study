import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/server/auth"

const bodySchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["student", "admin", "teacher"])
    const body = bodySchema.parse(await request.json())
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("can_access_lesson", {
      p_course_id: body.courseId,
      p_lesson_id: body.lessonId,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ canAccess: Boolean(data) })
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

    return NextResponse.json({ error: "Access check failed" }, { status: 500 })
  }
}
