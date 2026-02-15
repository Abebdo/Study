import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/server/auth"
import { createClient } from "@/lib/supabase/server"

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().default(""),
  price: z.number().min(0).default(0),
  isPublished: z.boolean().default(false),
})

export async function GET() {
  try {
    await requireAuth()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("courses")
      .select("id, instructor_id, title, description, is_published, price, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ courses: data ?? [] })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(["instructor", "admin"])
    const payload = createCourseSchema.parse(await request.json())
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("courses")
      .insert({
        instructor_id: auth.userId,
        title: payload.title,
        description: payload.description,
        price: payload.price,
        is_published: payload.isPublished,
      })
      .select("id, instructor_id, title, description, is_published, price, created_at, updated_at")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ course: data }, { status: 201 })
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
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
  }
}
