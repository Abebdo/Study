import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"

export async function GET() {
  try {
    const auth = await requireAuth()
    return NextResponse.json({ user: auth })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to load current user" }, { status: 500 })
  }
}
