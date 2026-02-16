import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server/auth"
import { launchFeatureCatalog } from "@/lib/launch-feature-catalog"
import { computeLaunchReadinessSummary, findCriticalBlockers } from "@/lib/launch-readiness"

export async function GET() {
  try {
    await requireAuth(["admin"])

    return NextResponse.json({
      success: true,
      summary: computeLaunchReadinessSummary(launchFeatureCatalog),
      blockers: findCriticalBlockers(launchFeatureCatalog),
      features: launchFeatureCatalog,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    return NextResponse.json({ error: "Failed to load launch readiness" }, { status: 500 })
  }
}
