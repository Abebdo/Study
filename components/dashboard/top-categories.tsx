import {
  Code,
  Palette,
  Calculator,
  Languages,
  FlaskConical,
  Music,
  BookOpen,
  Camera,
} from "lucide-react"
import Link from "next/link"

const categories = [
  {
    icon: Code,
    label: "Programming",
    color: "bg-blue-100 text-blue-600",
    href: "/dashboard/courses?cat=programming",
  },
  {
    icon: Palette,
    label: "Design",
    color: "bg-pink-100 text-pink-600",
    href: "/dashboard/courses?cat=design",
  },
  {
    icon: Calculator,
    label: "Mathematics",
    color: "bg-amber-100 text-amber-600",
    href: "/dashboard/courses?cat=math",
  },
  {
    icon: Languages,
    label: "Languages",
    color: "bg-green-100 text-green-600",
    href: "/dashboard/courses?cat=languages",
  },
  {
    icon: FlaskConical,
    label: "Science",
    color: "bg-purple-100 text-purple-600",
    href: "/dashboard/courses?cat=science",
  },
  {
    icon: Music,
    label: "Music",
    color: "bg-red-100 text-red-600",
    href: "/dashboard/courses?cat=music",
  },
  {
    icon: BookOpen,
    label: "Literature",
    color: "bg-teal-100 text-teal-600",
    href: "/dashboard/courses?cat=literature",
  },
  {
    icon: Camera,
    label: "Photography",
    color: "bg-orange-100 text-orange-600",
    href: "/dashboard/courses?cat=photography",
  },
]

export function TopCategories() {
  return (
    <div>
      <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
        Top categories
      </h3>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-all hover:bg-card hover:shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${cat.color} transition-transform group-hover:scale-110`}
            >
              <cat.icon className="h-5 w-5" />
            </div>
            <span className="text-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
