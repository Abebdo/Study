import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/server/auth"
import { createClient } from "@/lib/supabase/server"

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const createFavoriteSchema = z.object({
  courseId: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const parsed = querySchema.parse({
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    })

    const offset = (parsed.page - 1) * parsed.limit
    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from("favorites")
      .select("id, course_id, created_at", { count: "exact" })
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + parsed.limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const total = count ?? 0
    const pages = Math.ceil(total / parsed.limit)

    return NextResponse.json({
      success: true,
      data: data ?? [],
      pagination: {
        total,
        page: parsed.page,
        pages,
        limit: parsed.limit,
        hasNextPage: parsed.page < pages,
        hasPrevPage: parsed.page > 1,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 })
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    const payload = createFavoriteSchema.parse(await request.json())
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("favorites")
      .insert({
        user_id: auth.userId,
        course_id: payload.courseId,
      })
      .select("id, course_id, created_at")
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This course is already in your favorites" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 })
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
  }
}
