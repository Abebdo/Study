"use client"

import { type ReactNode, useMemo, useState } from "react"
import { CheckCircle2, Clock3, ListChecks, AlertTriangle } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { launchFeatureCatalog, type LaunchFeaturePriority, type LaunchFeatureStatus } from "@/lib/launch-feature-catalog"
import { cn } from "@/lib/utils"
import { computeLaunchReadinessSummary, findCriticalBlockers } from "@/lib/launch-readiness"

const statuses: Array<LaunchFeatureStatus | "all"> = ["all", "implemented", "in_progress", "planned"]
const priorities: Array<LaunchFeaturePriority | "all"> = ["all", "P0", "P1", "P2"]

export default function LaunchReadinessPage() {
  const [activeStatus, setActiveStatus] = useState<(typeof statuses)[number]>("all")
  const [activePriority, setActivePriority] = useState<(typeof priorities)[number]>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return launchFeatureCatalog.filter((item) => {
      const statusOk = activeStatus === "all" || item.status === activeStatus
      const priorityOk = activePriority === "all" || item.priority === activePriority
      const queryOk = !query.trim() || item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())
      return statusOk && priorityOk && queryOk
    })
  }, [activeStatus, activePriority, query])

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
      acc[item.category] = [...(acc[item.category] ?? []), item]
      return acc
    }, {})
  }, [filtered])

  const summary = useMemo(() => computeLaunchReadinessSummary(launchFeatureCatalog), [])
  const blockers = useMemo(() => findCriticalBlockers(launchFeatureCatalog), [])

  return (
    <AuthGuard requiredRoles={["admin"]}>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Launch Readiness Features</h1>
          <p className="text-sm text-muted-foreground">200 essential features with priorities, dependencies, and execution status.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <MetricCard icon={<ListChecks className="h-4 w-4 text-primary" />} label="Total" value={String(summary.total)} />
          <MetricCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} label="Implemented" value={String(summary.implemented)} />
          <MetricCard icon={<Clock3 className="h-4 w-4 text-amber-600" />} label="In Progress" value={String(summary.inProgress)} />
          <MetricCard icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} label="Planned" value={String(summary.planned)} />
          <MetricCard icon={<ListChecks className="h-4 w-4 text-indigo-600" />} label="P0 done" value={`${summary.p0ImplementedRate}%`} />
        </div>

        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Critical P0 blockers</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {blockers.map((item) => (
              <div key={item.id} className="rounded-lg border border-border px-3 py-2 text-xs text-foreground">
                {item.id} · {item.title}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by feature or category"
              className="rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button key={status} type="button" onClick={() => setActiveStatus(status)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium", activeStatus === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{status}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <button key={priority} type="button" onClick={() => setActivePriority(priority)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium", activePriority === priority ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground")}>{priority}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category} className="rounded-xl border border-border p-4">
                <h2 className="mb-3 text-sm font-semibold text-foreground">{category} ({items.length})</h2>
                <div className="grid gap-2 md:grid-cols-2">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-border px-3 py-2">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-foreground">{item.id} · {item.title}</p>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          item.status === "implemented" && "bg-emerald-100 text-emerald-700",
                          item.status === "in_progress" && "bg-amber-100 text-amber-700",
                          item.status === "planned" && "bg-muted text-muted-foreground",
                        )}>{item.status.replace("_", " ")}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="rounded bg-muted px-1.5 py-0.5">{item.priority}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{item.phase}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{item.owner}</span>
                        {item.dependsOn?.length ? <span className="rounded bg-muted px-1.5 py-0.5">depends: {item.dependsOn.join(", ")}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="mb-2 flex items-center gap-2">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}
