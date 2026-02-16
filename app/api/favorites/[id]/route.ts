import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/server/auth"
import { createClient } from "@/lib/supabase/server"

const paramsSchema = z.object({
  id: z.string().uuid(),
})

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth()
    const params = paramsSchema.parse(await context.params)

    const supabase = await createClient()

    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("id, user_id")
      .eq("id", params.id)
      .maybeSingle()

    if (favoriteError) {
      return NextResponse.json({ error: favoriteError.message }, { status: 400 })
    }

    if (!favorite) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 })
    }

    if (favorite.user_id !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("favorites").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 })
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
  }
}
