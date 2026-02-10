"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Plus,
  MoreVertical,
  Eye,
  Edit3,
  Trash2,
  Video,
  FileText,
  Star,
  Clock,
  BarChart3,
  Radio,
  Tag,
  Bell,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "courses" | "analytics" | "discounts" | "notifications"

const teacherCourses = [
  {
    id: 1,
    title: "Web Development Bootcamp",
    students: 12500,
    rating: 4.8,
    revenue: 62450,
    lessons: 156,
    status: "published" as const,
    color: "from-blue-500 to-blue-700",
    icon: "WD",
    lastUpdated: "2 days ago",
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    students: 8900,
    rating: 4.9,
    revenue: 53400,
    lessons: 128,
    status: "published" as const,
    color: "from-emerald-500 to-emerald-700",
    icon: "DS",
    lastUpdated: "1 week ago",
  },
  {
    id: 3,
    title: "Advanced React Patterns",
    students: 0,
    rating: 0,
    revenue: 0,
    lessons: 12,
    status: "draft" as const,
    color: "from-pink-500 to-pink-700",
    icon: "AR",
    lastUpdated: "3 hours ago",
  },
]

const discountCodes = [
  { code: "WELCOME50", discount: 50, type: "percentage" as const, uses: 234, maxUses: 500, active: true, expiry: "Mar 15, 2026" },
  { code: "NEWCOURSE", discount: 30, type: "percentage" as const, uses: 89, maxUses: 200, active: true, expiry: "Apr 1, 2026" },
  { code: "FLASH20", discount: 20, type: "fixed" as const, uses: 150, maxUses: 150, active: false, expiry: "Expired" },
]

const recentNotifications = [
  { title: "New Course Launch", message: "Web Development Bootcamp 2.0 is now live!", recipients: "All Students", time: "2h ago", sent: true },
  { title: "Live Session Reminder", message: "Don't forget: Live Q&A today at 5 PM!", recipients: "Web Dev Students", time: "5h ago", sent: true },
  { title: "Holiday Discount", message: "Get 40% off all courses this week!", recipients: "All Students", time: "1d ago", sent: true },
]

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("courses")
  const [showNewCourseModal, setShowNewCourseModal] = useState(false)
  const [showNewDiscountModal, setShowNewDiscountModal] = useState(false)
  const [showNewNotificationModal, setShowNewNotificationModal] = useState(false)

  const totalStudents = teacherCourses.reduce((a, c) => a + c.students, 0)
  const totalRevenue = teacherCourses.reduce((a, c) => a + c.revenue, 0)
  const avgRating = teacherCourses.filter(c => c.rating > 0).reduce((a, c) => a + c.rating, 0) / teacherCourses.filter(c => c.rating > 0).length

  const tabs = [
    { id: "courses" as Tab, label: "My Courses", icon: BookOpen },
    { id: "analytics" as Tab, label: "Analytics", icon: BarChart3 },
    { id: "discounts" as Tab, label: "Discount Codes", icon: Tag },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
  ]

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Teacher Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your courses, students, and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/teacher/live"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Radio className="h-4 w-4 text-red-500" />
            Go Live
          </Link>
          <button
            type="button"
            onClick={() => setShowNewCourseModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Course
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "bg-blue-100 text-blue-600", trend: "+12%" },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-emerald-100 text-emerald-600", trend: "+8%" },
          { label: "Avg Rating", value: avgRating.toFixed(1), icon: Star, color: "bg-amber-100 text-amber-600", trend: "+0.2" },
          { label: "Active Courses", value: String(teacherCourses.filter(c => c.status === "published").length), icon: BookOpen, color: "bg-pink-100 text-pink-600", trend: "+1" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-card p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          {teacherCourses.map((course) => (
            <div key={course.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md">
              <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${course.color}`}>
                <span className="text-lg font-bold text-white">{course.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{course.title}</h3>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    course.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {course.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students.toLocaleString()} students</span>
                  <span className="flex items-center gap-1"><Video className="h-3 w-3" />{course.lessons} lessons</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${course.revenue.toLocaleString()}</span>
                  {course.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{course.rating}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Updated {course.lastUpdated}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/teacher/course/${course.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Edit course"
                >
                  <Edit3 className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="View course"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Revenue Chart */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Revenue Overview</h2>
            <div className="flex items-end gap-3">
              {[
                { month: "Sep", value: 8200 },
                { month: "Oct", value: 12400 },
                { month: "Nov", value: 9800 },
                { month: "Dec", value: 15600 },
                { month: "Jan", value: 18200 },
                { month: "Feb", value: 22100 },
              ].map((item) => {
                const maxVal = 22100
                const height = (item.value / maxVal) * 140
                return (
                  <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">${(item.value / 1000).toFixed(1)}k</span>
                    <div className="w-full rounded-lg bg-gradient-to-t from-primary to-primary/70 transition-all" style={{ height: `${height}px` }} />
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Student Engagement */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">Top Performing Courses</h3>
              <div className="space-y-3">
                {teacherCourses.filter(c => c.status === "published").map((course, i) => (
                  <div key={course.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.students.toLocaleString()} students</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">${course.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-heading text-sm font-semibold text-foreground">Student Demographics</h3>
              <div className="space-y-3">
                {[
                  { region: "North America", percentage: 35, count: "7.5k" },
                  { region: "Europe", percentage: 28, count: "6k" },
                  { region: "Asia", percentage: 22, count: "4.7k" },
                  { region: "Middle East", percentage: 10, count: "2.1k" },
                  { region: "Others", percentage: 5, count: "1.1k" },
                ].map((item) => (
                  <div key={item.region}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.region}</span>
                      <span className="font-medium text-foreground">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-secondary to-accent" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discounts Tab */}
      {activeTab === "discounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Discount Codes</h2>
            <button
              type="button"
              onClick={() => setShowNewDiscountModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              New Code
            </button>
          </div>
          {discountCodes.map((code) => (
            <div key={code.code} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                code.active ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"
              )}>
                <Tag className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-foreground">{code.code}</h3>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    code.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  )}>
                    {code.active ? "Active" : "Expired"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{code.type === "percentage" ? `${code.discount}% off` : `$${code.discount} off`}</span>
                  <span>{code.uses}/{code.maxUses} uses</span>
                  <span>{code.expiry}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground" aria-label="Edit">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-destructive" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Sent Notifications</h2>
            <button
              type="button"
              onClick={() => setShowNewNotificationModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Bell className="h-4 w-4" />
              Send New
            </button>
          </div>
          {recentNotifications.map((notif) => (
            <div key={notif.title} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="mb-0.5 text-sm font-semibold text-foreground">{notif.title}</h3>
                <p className="mb-1 text-xs text-muted-foreground">{notif.message}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{notif.recipients}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{notif.time}</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-medium text-emerald-700">Sent</span>
            </div>
          ))}
        </div>
      )}

      {/* New Course Modal */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setShowNewCourseModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Create New Course</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="courseTitle" className="mb-1.5 block text-sm font-medium text-muted-foreground">Course Title</label>
                <input id="courseTitle" type="text" placeholder="Enter course title..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="courseDesc" className="mb-1.5 block text-sm font-medium text-muted-foreground">Description</label>
                <textarea id="courseDesc" rows={3} placeholder="What will students learn?" className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="courseCategory" className="mb-1.5 block text-sm font-medium text-muted-foreground">Category</label>
                  <select id="courseCategory" className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary">
                    <option>Programming</option>
                    <option>Design</option>
                    <option>Mathematics</option>
                    <option>Languages</option>
                    <option>Science</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="courseLevel" className="mb-1.5 block text-sm font-medium text-muted-foreground">Level</label>
                  <select id="courseLevel" className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="coursePrice" className="mb-1.5 block text-sm font-medium text-muted-foreground">Price ($)</label>
                <input id="coursePrice" type="number" placeholder="49.99" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-secondary bg-secondary/5 p-4">
                <Sparkles className="h-5 w-5 text-secondary" />
                <p className="text-xs text-muted-foreground">AI will automatically generate a cover image based on the course title and description.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewCourseModal(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                <button type="button" onClick={() => setShowNewCourseModal(false)} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Create Course</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Discount Modal */}
      {showNewDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setShowNewDiscountModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Create Discount Code</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="discountCode" className="mb-1.5 block text-sm font-medium text-muted-foreground">Code</label>
                <input id="discountCode" type="text" placeholder="e.g. SUMMER50" className="w-full rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discountType" className="mb-1.5 block text-sm font-medium text-muted-foreground">Type</label>
                  <select id="discountType" className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary">
                    <option>Percentage</option>
                    <option>Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="discountValue" className="mb-1.5 block text-sm font-medium text-muted-foreground">Value</label>
                  <input id="discountValue" type="number" placeholder="50" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maxUses" className="mb-1.5 block text-sm font-medium text-muted-foreground">Max Uses</label>
                  <input id="maxUses" type="number" placeholder="500" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label htmlFor="expiryDate" className="mb-1.5 block text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <input id="expiryDate" type="date" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label htmlFor="appliesTo" className="mb-1.5 block text-sm font-medium text-muted-foreground">Applies To</label>
                <select id="appliesTo" className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary">
                  <option>All Courses</option>
                  <option>Web Development Bootcamp</option>
                  <option>Data Science Fundamentals</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewDiscountModal(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                <button type="button" onClick={() => setShowNewDiscountModal(false)} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Create Code</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Notification Modal */}
      {showNewNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setShowNewNotificationModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Send Notification</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="notifTitle" className="mb-1.5 block text-sm font-medium text-muted-foreground">Title</label>
                <input id="notifTitle" type="text" placeholder="Notification title..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="notifMessage" className="mb-1.5 block text-sm font-medium text-muted-foreground">Message</label>
                <textarea id="notifMessage" rows={3} placeholder="Write your notification message..." className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="notifRecipients" className="mb-1.5 block text-sm font-medium text-muted-foreground">Recipients</label>
                <select id="notifRecipients" className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary">
                  <option>All Platform Students</option>
                  <option>Web Development Bootcamp Students</option>
                  <option>Data Science Fundamentals Students</option>
                  <option>Premium Members Only</option>
                </select>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-secondary bg-secondary/5 p-4">
                <Sparkles className="h-5 w-5 text-secondary" />
                <p className="text-xs text-muted-foreground">AI will optimize your message for maximum engagement and clarity.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowNewNotificationModal(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
                <button type="button" onClick={() => setShowNewNotificationModal(false)} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
