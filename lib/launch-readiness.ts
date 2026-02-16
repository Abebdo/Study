import { launchFeatureCatalog, type LaunchFeatureItem } from "@/lib/launch-feature-catalog"

export type LaunchReadinessSummary = {
  total: number
  implemented: number
  inProgress: number
  planned: number
  completionRate: number
  p0ImplementedRate: number
}

export function computeLaunchReadinessSummary(items: LaunchFeatureItem[] = launchFeatureCatalog): LaunchReadinessSummary {
  const total = items.length
  const implemented = items.filter((item) => item.status === "implemented").length
  const inProgress = items.filter((item) => item.status === "in_progress").length
  const planned = items.filter((item) => item.status === "planned").length

  const p0 = items.filter((item) => item.priority === "P0")
  const p0Implemented = p0.filter((item) => item.status === "implemented").length

  return {
    total,
    implemented,
    inProgress,
    planned,
    completionRate: total === 0 ? 0 : Number(((implemented / total) * 100).toFixed(1)),
    p0ImplementedRate: p0.length === 0 ? 0 : Number(((p0Implemented / p0.length) * 100).toFixed(1)),
  }
}

export function findCriticalBlockers(items: LaunchFeatureItem[] = launchFeatureCatalog) {
  return items
    .filter((item) => item.priority === "P0" && item.status !== "implemented")
    .slice(0, 12)
}
