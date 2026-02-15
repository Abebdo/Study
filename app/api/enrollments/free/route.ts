import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/server/auth"

const schema = z.object({ courseId: z.string().uuid() })

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["student", "admin"])
    const { courseId } = schema.parse(await request.json())
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("enroll_in_free_course", {
      p_course_id: courseId,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ enrollmentId: data }, { status: 201 })
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
    return NextResponse.json({ error: "Enrollment failed" }, { status: 500 })
  }
}
