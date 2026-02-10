import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner"
import { TopCategories } from "@/components/dashboard/top-categories"
import { RecentCourses } from "@/components/dashboard/recent-courses"
import { ProfileSidebar } from "@/components/dashboard/profile-sidebar"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:flex-row lg:p-6">
      {/* Main content */}
      <div className="flex-1 space-y-6">
        <DashboardHeader />
        <UpgradeBanner />
        <TopCategories />
        <RecentCourses />
      </div>
      {/* Right sidebar */}
      <div className="w-full lg:w-80">
        <ProfileSidebar />
      </div>
    </div>
  )
}
