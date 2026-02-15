import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/server/auth"

const bodySchema = z.object({
  quizId: z.string().uuid(),
  submittedAnswers: z.record(z.any()),
})

export async function POST(request: NextRequest) {
  try {
    await requireAuth(["student", "admin"])
    const body = bodySchema.parse(await request.json())
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("submit_quiz_attempt", {
      p_quiz_id: body.quizId,
      p_submitted_answers: body.submittedAnswers,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ attemptId: data }, { status: 201 })
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

    return NextResponse.json({ error: "Submit quiz attempt failed" }, { status: 500 })
  }
}
