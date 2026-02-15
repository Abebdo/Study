import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const auth = await requireAuth(["instructor", "admin"])
    const supabase = await createClient()

    let query = supabase
      .from("courses")
      .select("id, instructor_id, title, description, is_published, price, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (auth.role === "instructor") {
      query = query.eq("instructor_id", auth.userId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ courses: data ?? [] })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    return NextResponse.json({ error: "Failed to fetch instructor courses" }, { status: 500 })
  }
}
