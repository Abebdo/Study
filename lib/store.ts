"use client"

// ============================================================
// CENTRAL LMS STORE - All platform state lives here
// ============================================================

export type UserRole = "student" | "teacher" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  bio?: string
  joinedAt: string
  isPremium: boolean
  streak: number
  totalHoursLearned: number
  settings: UserSettings
}

export interface UserSettings {
  language: string
  theme: "light" | "dark" | "system"
  notifications: {
    courseUpdates: boolean
    assignments: boolean
    messages: boolean
    promotions: boolean
    weeklyReport: boolean
    achievements: boolean
    liveReminders: boolean
    aiSuggestions: boolean
  }
  privacy: {
    showProfile: boolean
    showProgress: boolean
    showActivity: boolean
  }
  ai: {
    enabled: boolean
    suggestions: boolean
    autoSummarize: boolean
  }
}

export interface Enrollment {
  courseId: number
  userId: string
  enrolledAt: string
  progress: number
  completedLessons: number[]
  lastAccessedAt: string
  watchTimes: Record<number, number> // lessonId -> seconds watched
  quizResults: QuizResult[]
  certificate?: { issuedAt: string; id: string }
}

export interface QuizResult {
  quizId: string
  lessonId: number
  courseId: number
  score: number
  totalQuestions: number
  answers: (number | null)[]
  completedAt: string
  attempt: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  attachments?: { name: string; type: string; url: string }[]
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[]
  type: "direct" | "group"
  name?: string
  lastMessage?: Message
  unreadCount: number
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  type: "course" | "live" | "discount" | "achievement" | "message" | "update" | "quiz" | "encouragement"
  title: string
  message: string
  time: string
  read: boolean
  link?: string
  courseId?: number
}

export interface LiveSession {
  id: string
  title: string
  courseId: number
  instructorId: string
  status: "scheduled" | "live" | "ended"
  scheduledAt: string
  startedAt?: string
  endedAt?: string
  viewers: number
  attendees: string[]
  recordingUrl?: string
  chatMessages: { user: string; message: string; time: string }[]
}

export interface DiscountCode {
  code: string
  discount: number
  type: "percentage" | "fixed"
  uses: number
  maxUses: number
  active: boolean
  expiry: string
  courseId?: number // null means all courses
  createdBy: string
}

export interface Achievement {
  id: string
  label: string
  description: string
  icon: string
  unlockedAt?: string
}

// ============================================================
// DEFAULT DATA
// ============================================================

export const defaultUsers: User[] = [
  {
    id: "student-1",
    name: "Ronald Richards",
    email: "ron.richards@gmail.com",
    role: "student",
    bio: "Passionate learner exploring web development and data science.",
    joinedAt: "2025-06-15",
    isPremium: true,
    streak: 12,
    totalHoursLearned: 62,
    settings: {
      language: "English",
      theme: "light",
      notifications: {
        courseUpdates: true,
        assignments: true,
        messages: true,
        promotions: false,
        weeklyReport: true,
        achievements: true,
        liveReminders: true,
        aiSuggestions: true,
      },
      privacy: { showProfile: true, showProgress: true, showActivity: true },
      ai: { enabled: true, suggestions: true, autoSummarize: false },
    },
  },
  {
    id: "teacher-1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techacademy.com",
    role: "teacher",
    bio: "Senior Web Developer & Educator with 10+ years of experience.",
    joinedAt: "2024-01-10",
    isPremium: true,
    streak: 0,
    totalHoursLearned: 0,
    settings: {
      language: "English",
      theme: "light",
      notifications: {
        courseUpdates: true,
        assignments: true,
        messages: true,
        promotions: false,
        weeklyReport: true,
        achievements: true,
        liveReminders: true,
        aiSuggestions: true,
      },
      privacy: { showProfile: true, showProgress: true, showActivity: true },
      ai: { enabled: true, suggestions: true, autoSummarize: true },
    },
  },
  {
    id: "admin-1",
    name: "Platform Admin",
    email: "admin@eduplatform.com",
    role: "admin",
    bio: "Platform administrator",
    joinedAt: "2024-01-01",
    isPremium: true,
    streak: 0,
    totalHoursLearned: 0,
    settings: {
      language: "English",
      theme: "light",
      notifications: {
        courseUpdates: true,
        assignments: true,
        messages: true,
        promotions: true,
        weeklyReport: true,
        achievements: true,
        liveReminders: true,
        aiSuggestions: true,
      },
      privacy: { showProfile: false, showProgress: false, showActivity: false },
      ai: { enabled: true, suggestions: true, autoSummarize: true },
    },
  },
]

export const defaultEnrollments: Enrollment[] = [
  {
    courseId: 1,
    userId: "student-1",
    enrolledAt: "2025-08-01",
    progress: 65,
    completedLessons: [1, 2, 3, 4, 5, 6],
    lastAccessedAt: "2026-02-10T08:00:00",
    watchTimes: { 1: 900, 2: 1320, 3: 1080, 4: 600, 5: 1200, 6: 1500 },
    quizResults: [
      { quizId: "q-1-4", lessonId: 4, courseId: 1, score: 3, totalQuestions: 3, answers: [0, 1, 2], completedAt: "2025-09-10", attempt: 1 },
    ],
  },
  {
    courseId: 2,
    userId: "student-1",
    enrolledAt: "2025-10-15",
    progress: 30,
    completedLessons: [1, 2, 3],
    lastAccessedAt: "2026-02-09T15:00:00",
    watchTimes: { 1: 600, 2: 900, 3: 1200 },
    quizResults: [],
  },
  {
    courseId: 5,
    userId: "student-1",
    enrolledAt: "2025-12-01",
    progress: 12,
    completedLessons: [1],
    lastAccessedAt: "2026-02-07T10:00:00",
    watchTimes: { 1: 600 },
    quizResults: [],
  },
  {
    courseId: 8,
    userId: "student-1",
    enrolledAt: "2025-07-20",
    progress: 85,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8],
    lastAccessedAt: "2026-02-10T05:00:00",
    watchTimes: {},
    quizResults: [],
  },
  {
    courseId: 6,
    userId: "student-1",
    enrolledAt: "2025-03-01",
    progress: 100,
    completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    lastAccessedAt: "2026-01-15T12:00:00",
    watchTimes: {},
    quizResults: [],
    certificate: { issuedAt: "2026-01-15", id: "cert-6-student-1" },
  },
]

export const defaultAchievements: Achievement[] = [
  { id: "first-course", label: "First Course", description: "Enrolled in your first course", icon: "BookOpen", unlockedAt: "2025-07-20" },
  { id: "5-day-streak", label: "5-Day Streak", description: "Learned for 5 days in a row", icon: "Flame", unlockedAt: "2025-08-15" },
  { id: "quiz-master", label: "Quiz Master", description: "Scored 100% on a quiz", icon: "Award", unlockedAt: "2025-09-10" },
  { id: "10-lessons", label: "10 Lessons", description: "Completed 10 lessons", icon: "BookOpen", unlockedAt: "2025-10-01" },
  { id: "night-owl", label: "Night Owl", description: "Study after midnight", icon: "Moon" },
  { id: "speed-learner", label: "Speed Learner", description: "Complete 5 lessons in one day", icon: "Zap" },
  { id: "social-butterfly", label: "Social Butterfly", description: "Send 50 messages", icon: "MessageSquare" },
  { id: "course-complete", label: "Graduate", description: "Complete a full course", icon: "GraduationCap", unlockedAt: "2026-01-15" },
]

export const defaultDiscountCodes: DiscountCode[] = [
  { code: "WELCOME50", discount: 50, type: "percentage", uses: 234, maxUses: 500, active: true, expiry: "Mar 15, 2026", createdBy: "teacher-1" },
  { code: "NEWCOURSE", discount: 30, type: "percentage", uses: 89, maxUses: 200, active: true, expiry: "Apr 1, 2026", createdBy: "teacher-1" },
  { code: "FLASH20", discount: 20, type: "fixed", uses: 150, maxUses: 150, active: false, expiry: "Expired", createdBy: "teacher-1" },
  { code: "SAVE10", discount: 10, type: "fixed", uses: 45, maxUses: 300, active: true, expiry: "Jun 1, 2026", createdBy: "teacher-1" },
]

export const defaultNotifications: Notification[] = [
  { id: "n1", userId: "student-1", type: "live", title: "Live Session Starting Soon", message: "React Hooks Deep Dive with Sarah Johnson starts in 30 minutes.", time: "30 min ago", read: false, link: "/dashboard/live" },
  { id: "n2", userId: "student-1", type: "discount", title: "Special Offer!", message: "Get 50% off Advanced React Patterns. Use code WELCOME50.", time: "1h ago", read: false, link: "/dashboard/courses" },
  { id: "n3", userId: "student-1", type: "course", title: "New Lesson Available", message: "CSS Grid lesson has been added to Web Development Bootcamp.", time: "2h ago", read: false, link: "/dashboard/courses/1", courseId: 1 },
  { id: "n4", userId: "student-1", type: "achievement", title: "Achievement Unlocked!", message: "Congratulations! You earned the 'Quiz Master' badge.", time: "5h ago", read: true },
  { id: "n5", userId: "student-1", type: "message", title: "New Message from Sarah Johnson", message: "Great job on the last assignment! Keep it up.", time: "6h ago", read: true, link: "/dashboard/chats" },
  { id: "n6", userId: "student-1", type: "update", title: "Course Updated", message: "Data Science Fundamentals has been updated with 3 new modules.", time: "1d ago", read: true, link: "/dashboard/courses/2", courseId: 2 },
  { id: "n7", userId: "student-1", type: "encouragement", title: "Keep Going!", message: "You're on a 12-day streak! Don't break it. Your next lesson awaits.", time: "2d ago", read: true },
]

export const defaultConversations: Conversation[] = [
  {
    id: "conv-1",
    participants: ["student-1", "teacher-1"],
    type: "direct",
    unreadCount: 2,
    createdAt: "2025-08-01",
  },
  {
    id: "conv-2",
    participants: ["student-1"],
    type: "group",
    name: "Study Group - Web Dev",
    unreadCount: 5,
    createdAt: "2025-09-01",
  },
]

export const defaultMessages: Message[] = [
  { id: "m1", conversationId: "conv-1", senderId: "teacher-1", content: "Hi Ronald! I just reviewed your latest project submission for the Web Development course.", timestamp: "2026-02-10T10:30:00", read: true, attachments: [] },
  { id: "m2", conversationId: "conv-1", senderId: "student-1", content: "Thanks, Sarah! I worked really hard on the React components part.", timestamp: "2026-02-10T10:32:00", read: true },
  { id: "m3", conversationId: "conv-1", senderId: "teacher-1", content: "I can tell! Your component structure is very clean and well-organized. The state management approach is excellent.", timestamp: "2026-02-10T10:35:00", read: true },
  { id: "m4", conversationId: "conv-1", senderId: "student-1", content: "That means a lot coming from you! Any areas for improvement?", timestamp: "2026-02-10T10:36:00", read: true },
  { id: "m5", conversationId: "conv-1", senderId: "teacher-1", content: "Just a small suggestion - try to add more error handling in your API calls. Also, consider using custom hooks to abstract shared logic. Overall great work!", timestamp: "2026-02-10T10:40:00", read: false },
  { id: "m6", conversationId: "conv-1", senderId: "teacher-1", content: "Great job on the last assignment! Keep it up.", timestamp: "2026-02-10T10:42:00", read: false },
  { id: "m7", conversationId: "conv-2", senderId: "student-1", content: "Does anyone have notes for the React module?", timestamp: "2026-02-10T09:00:00", read: true },
]

export const defaultLiveSessions: LiveSession[] = [
  {
    id: "live-1",
    title: "React Hooks Deep Dive - Live Q&A",
    courseId: 1,
    instructorId: "teacher-1",
    status: "live",
    scheduledAt: "2026-02-10T14:00:00",
    startedAt: "2026-02-10T14:00:00",
    viewers: 342,
    attendees: ["student-1"],
    chatMessages: [
      { user: "Alex M.", message: "Great explanation of useEffect!", time: "2 min ago" },
      { user: "Sara K.", message: "Can you show the dependency array again?", time: "1 min ago" },
      { user: "John D.", message: "This is so helpful, thanks!", time: "30s ago" },
    ],
  },
  {
    id: "live-2",
    title: "Data Visualization with Python",
    courseId: 2,
    instructorId: "teacher-1",
    status: "scheduled",
    scheduledAt: "2026-02-10T17:00:00",
    viewers: 0,
    attendees: [],
    chatMessages: [],
  },
  {
    id: "live-3",
    title: "Portfolio Design Workshop",
    courseId: 3,
    instructorId: "teacher-1",
    status: "scheduled",
    scheduledAt: "2026-02-11T15:00:00",
    viewers: 0,
    attendees: [],
    chatMessages: [],
  },
]
