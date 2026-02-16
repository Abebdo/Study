import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function UpgradeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-8 md:px-10 md:py-10">
      <div className="relative z-10 max-w-md">
        <h2 className="mb-2 font-heading text-xl font-bold text-primary-foreground md:text-2xl">
          Upgrade your plan
        </h2>
        <p className="mb-1 text-sm leading-relaxed text-primary-foreground/80">
          <span className="font-bold text-secondary">70% discount</span> for{" "}
          <span className="font-semibold text-primary-foreground">
            1 year subscription
          </span>
        </p>
        <p className="mb-6 text-sm text-primary-foreground/70">
          Unlock all courses and get unlimited access to premium content.
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Start premium
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Decorative illustration area */}
      <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:block">
        <div className="flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-secondary/20">
            <Sparkles className="h-10 w-10 text-secondary" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-3 w-20 rounded-full bg-primary-foreground/10" />
            <div className="h-3 w-16 rounded-full bg-primary-foreground/10" />
            <div className="h-3 w-24 rounded-full bg-primary-foreground/10" />
          </div>
        </div>
      </div>

      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-secondary/10" />
      <div className="absolute -bottom-6 right-24 h-20 w-20 rounded-full bg-accent/10" />
    </div>
  )
}
