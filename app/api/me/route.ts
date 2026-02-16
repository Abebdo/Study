import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"

function mapServerError(error: unknown) {
  if (!(error instanceof Error)) {
    return { status: 500, error: "Failed to load current user", code: "UNKNOWN_ERROR" }
  }

  if (error.message === "UNAUTHORIZED") {
    return { status: 401, error: "Unauthorized", code: "UNAUTHORIZED" }
  }

  if (error.message === "SUPABASE_NOT_CONFIGURED" || error.message === "SUPABASE_INVALID_PUBLIC_CONFIG") {
    return {
      status: 503,
      error: "Authentication backend is not configured correctly.",
      code: error.message,
    }
  }

  return { status: 500, error: "Failed to load current user", code: "INTERNAL_ERROR" }
}

export async function GET() {
  try {
    const auth = await requireAuth()
    return NextResponse.json({ user: auth })
  } catch (error) {
    const mapped = mapServerError(error)
    return NextResponse.json({ error: mapped.error, code: mapped.code }, { status: mapped.status })
  }
}
