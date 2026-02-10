import { Clock, Star, Users } from "lucide-react"
import Link from "next/link"

const courses = [
  {
    id: 1,
    title: "Web Development Bootcamp",
    description: "From HTML basics to full-stack JavaScript applications",
    instructor: "Sarah Johnson",
    institution: "Tech Academy",
    rating: 4.8,
    students: 12500,
    duration: "42h",
    color: "from-blue-500 to-blue-700",
    icon: "WD",
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    description: "Learn Python, statistics, and machine learning basics",
    instructor: "Ahmed Hassan",
    institution: "DataSchool",
    rating: 4.9,
    students: 8900,
    duration: "38h",
    color: "from-emerald-500 to-emerald-700",
    icon: "DS",
  },
  {
    id: 3,
    title: "UI/UX Design Mastery",
    description: "Design beautiful interfaces with modern design principles",
    instructor: "Maria Garcia",
    institution: "Design Institute",
    rating: 4.7,
    students: 6700,
    duration: "28h",
    color: "from-pink-500 to-pink-700",
    icon: "UX",
  },
  {
    id: 4,
    title: "Mobile App Development",
    description: "Build iOS and Android apps with React Native",
    instructor: "James Chen",
    institution: "Mobile Academy",
    rating: 4.6,
    students: 5200,
    duration: "35h",
    color: "from-amber-500 to-amber-700",
    icon: "MA",
  },
]

export function RecentCourses() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Popular courses
        </h3>
        <Link
          href="/dashboard/courses"
          className="text-sm font-medium text-secondary hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/dashboard/courses/${course.id}`}
            className="group overflow-hidden rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex gap-4">
              <div
                className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${course.color}`}
              >
                <span className="text-lg font-bold text-card">{course.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="mb-1 truncate font-heading text-sm font-semibold text-foreground group-hover:text-primary">
                  {course.title}
                </h4>
                <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">
                  {course.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.students.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {course.instructor[0]}
              </div>
              <div className="text-xs">
                <span className="font-medium text-foreground">
                  {course.instructor}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  - {course.institution}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
