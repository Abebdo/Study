"use client"

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  type User,
  type UserRole,
  type Enrollment,
  type Notification,
  type Conversation,
  type Message,
  type LiveSession,
  type DiscountCode,
  type Achievement,
  type QuizResult,
  defaultUsers,
  defaultEnrollments,
  defaultNotifications,
  defaultConversations,
  defaultMessages,
  defaultLiveSessions,
  defaultDiscountCodes,
  defaultAchievements,
} from "./store"

// ============================================================
// PLATFORM CONTEXT - Single source of truth
// ============================================================

interface PlatformContextType {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string, role: UserRole) => { success: boolean; error?: string }
  logout: () => void
  updateUser: (updates: Partial<User>) => void

  // Authorization helpers
  isStudent: boolean
  isTeacher: boolean
  isAdmin: boolean
  canAccess: (requiredRole: UserRole[]) => boolean

  // Enrollments
  enrollments: Enrollment[]
  isEnrolled: (courseId: number) => boolean
  enrollInCourse: (courseId: number) => void
  getEnrollment: (courseId: number) => Enrollment | undefined
  completeLesson: (courseId: number, lessonId: number) => void
  updateWatchTime: (courseId: number, lessonId: number, seconds: number) => void
  submitQuizResult: (result: QuizResult) => void
  getCourseProgress: (courseId: number) => number

  // Notifications
  notifications: Notification[]
  unreadNotificationCount: number
  addNotification: (notif: Omit<Notification, "id">) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  deleteNotification: (id: string) => void

  // Messaging
  conversations: Conversation[]
  messages: Message[]
  getConversationMessages: (conversationId: string) => Message[]
  sendMessage: (conversationId: string, content: string, attachments?: Message["attachments"]) => void
  totalUnreadMessages: number

  // Favorites
  favorites: number[]
  toggleFavorite: (courseId: number) => void
  isFavorite: (courseId: number) => boolean

  // Live Sessions
  liveSessions: LiveSession[]
  addLiveSession: (session: Omit<LiveSession, "id">) => void
  updateLiveSession: (id: string, updates: Partial<LiveSession>) => void

  // Discount Codes
  discountCodes: DiscountCode[]
  addDiscountCode: (code: Omit<DiscountCode, "uses">) => void
  validateDiscount: (code: string) => { valid: boolean; discount?: DiscountCode; error?: string }
  useDiscountCode: (code: string) => void

  // Achievements
  achievements: Achievement[]
  unlockAchievement: (id: string) => void

  // All users (for admin/teacher)
  allUsers: User[]
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>(defaultUsers)
  const [enrollments, setEnrollments] = useState<Enrollment[]>(defaultEnrollments)
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications)
  const [conversations, setConversations] = useState<Conversation[]>(defaultConversations)
  const [messages, setMessages] = useState<Message[]>(defaultMessages)
  const [favorites, setFavorites] = useState<number[]>([3, 5, 7, 8, 10, 12])
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(defaultLiveSessions)
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(defaultDiscountCodes)
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements)

  // ---- AUTH ----
  const login = useCallback((email: string, _password: string) => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return { success: false, error: "User not found. Please check your email." }
    // In a real app, we'd verify password hash. For demo, any password works.
    setCurrentUser(user)
    return { success: true }
  }, [allUsers])

  const signup = useCallback((name: string, email: string, _password: string, role: UserRole) => {
    if (allUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email already registered." }
    }
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
      bio: "",
      joinedAt: new Date().toISOString().split("T")[0],
      isPremium: false,
      streak: 0,
      totalHoursLearned: 0,
      settings: {
        language: "English",
        theme: "light",
        notifications: {
          courseUpdates: true, assignments: true, messages: true, promotions: false,
          weeklyReport: true, achievements: true, liveReminders: true, aiSuggestions: true,
        },
        privacy: { showProfile: true, showProgress: true, showActivity: true },
        ai: { enabled: true, suggestions: true, autoSummarize: false },
      },
    }
    setAllUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    return { success: true }
  }, [allUsers])

  const logout = useCallback(() => {
    setCurrentUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!currentUser) return
    const updated = { ...currentUser, ...updates }
    setCurrentUser(updated)
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }, [currentUser])

  // ---- AUTHORIZATION ----
  const isStudent = currentUser?.role === "student"
  const isTeacher = currentUser?.role === "teacher"
  const isAdmin = currentUser?.role === "admin"
  const canAccess = useCallback((roles: UserRole[]) => {
    if (!currentUser) return false
    return roles.includes(currentUser.role)
  }, [currentUser])

  // ---- ENROLLMENTS ----
  const isEnrolled = useCallback((courseId: number) => {
    if (!currentUser) return false
    return enrollments.some(e => e.courseId === courseId && e.userId === currentUser.id)
  }, [currentUser, enrollments])

  const enrollInCourse = useCallback((courseId: number) => {
    if (!currentUser) return
    if (isEnrolled(courseId)) return
    const newEnrollment: Enrollment = {
      courseId,
      userId: currentUser.id,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedLessons: [],
      lastAccessedAt: new Date().toISOString(),
      watchTimes: {},
      quizResults: [],
    }
    setEnrollments(prev => [...prev, newEnrollment])
    // Auto notification
    addNotification({
      userId: currentUser.id,
      type: "course",
      title: "Course Enrolled!",
      message: `You've successfully enrolled. Start learning now!`,
      time: "Just now",
      read: false,
      link: `/dashboard/courses/${courseId}`,
      courseId,
    })
  }, [currentUser, isEnrolled])

  const getEnrollment = useCallback((courseId: number) => {
    if (!currentUser) return undefined
    return enrollments.find(e => e.courseId === courseId && e.userId === currentUser.id)
  }, [currentUser, enrollments])

  const completeLesson = useCallback((courseId: number, lessonId: number) => {
    if (!currentUser) return
    setEnrollments(prev => prev.map(e => {
      if (e.courseId === courseId && e.userId === currentUser.id) {
        const completed = e.completedLessons.includes(lessonId)
          ? e.completedLessons
          : [...e.completedLessons, lessonId]
        return { ...e, completedLessons: completed, lastAccessedAt: new Date().toISOString() }
      }
      return e
    }))
  }, [currentUser])

  const updateWatchTime = useCallback((courseId: number, lessonId: number, seconds: number) => {
    if (!currentUser) return
    setEnrollments(prev => prev.map(e => {
      if (e.courseId === courseId && e.userId === currentUser.id) {
        return { ...e, watchTimes: { ...e.watchTimes, [lessonId]: seconds }, lastAccessedAt: new Date().toISOString() }
      }
      return e
    }))
  }, [currentUser])

  const submitQuizResult = useCallback((result: QuizResult) => {
    if (!currentUser) return
    setEnrollments(prev => prev.map(e => {
      if (e.courseId === result.courseId && e.userId === currentUser.id) {
        return { ...e, quizResults: [...e.quizResults, result] }
      }
      return e
    }))
    // Check for quiz master achievement
    if (result.score === result.totalQuestions) {
      unlockAchievement("quiz-master")
    }
  }, [currentUser])

  const getCourseProgress = useCallback((courseId: number) => {
    const enrollment = enrollments.find(e => e.courseId === courseId && e.userId === currentUser?.id)
    return enrollment?.progress ?? 0
  }, [enrollments, currentUser])

  // ---- NOTIFICATIONS ----
  const addNotification = useCallback((notif: Omit<Notification, "id">) => {
    const newNotif: Notification = { ...notif, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
    setNotifications(prev => [newNotif, ...prev])
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    if (!currentUser) return
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n))
  }, [currentUser])

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const unreadNotificationCount = currentUser
    ? notifications.filter(n => n.userId === currentUser.id && !n.read).length
    : 0

  // ---- MESSAGING ----
  const getConversationMessages = useCallback((conversationId: string) => {
    return messages.filter(m => m.conversationId === conversationId)
  }, [messages])

  const sendMessage = useCallback((conversationId: string, content: string, attachments?: Message["attachments"]) => {
    if (!currentUser || !content.trim()) return
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      attachments,
      read: false,
    }
    setMessages(prev => [...prev, newMsg])
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, lastMessage: newMsg } : c
    ))
  }, [currentUser])

  const totalUnreadMessages = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  // ---- FAVORITES ----
  const toggleFavorite = useCallback((courseId: number) => {
    setFavorites(prev => prev.includes(courseId)
      ? prev.filter(id => id !== courseId)
      : [...prev, courseId]
    )
  }, [])

  const isFavorite = useCallback((courseId: number) => favorites.includes(courseId), [favorites])

  // ---- LIVE SESSIONS ----
  const addLiveSession = useCallback((session: Omit<LiveSession, "id">) => {
    setLiveSessions(prev => [...prev, { ...session, id: `live-${Date.now()}` }])
  }, [])

  const updateLiveSession = useCallback((id: string, updates: Partial<LiveSession>) => {
    setLiveSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  // ---- DISCOUNTS ----
  const addDiscountCode = useCallback((code: Omit<DiscountCode, "uses">) => {
    setDiscountCodes(prev => [...prev, { ...code, uses: 0 }])
  }, [])

  const validateDiscount = useCallback((code: string) => {
    const found = discountCodes.find(d => d.code.toUpperCase() === code.toUpperCase())
    if (!found) return { valid: false, error: "Invalid discount code." }
    if (!found.active) return { valid: false, error: "This code has expired." }
    if (found.uses >= found.maxUses) return { valid: false, error: "This code has reached maximum usage." }
    return { valid: true, discount: found }
  }, [discountCodes])

  const useDiscountCode = useCallback((code: string) => {
    setDiscountCodes(prev => prev.map(d =>
      d.code.toUpperCase() === code.toUpperCase() ? { ...d, uses: d.uses + 1 } : d
    ))
  }, [])

  // ---- ACHIEVEMENTS ----
  const unlockAchievement = useCallback((id: string) => {
    setAchievements(prev => prev.map(a =>
      a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
    ))
    if (currentUser) {
      addNotification({
        userId: currentUser.id,
        type: "achievement",
        title: "Achievement Unlocked!",
        message: `You earned a new badge!`,
        time: "Just now",
        read: false,
      })
    }
  }, [currentUser, addNotification])

  const value: PlatformContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    signup,
    logout,
    updateUser,
    isStudent,
    isTeacher,
    isAdmin,
    canAccess,
    enrollments: currentUser ? enrollments.filter(e => e.userId === currentUser.id) : [],
    isEnrolled,
    enrollInCourse,
    getEnrollment,
    completeLesson,
    updateWatchTime,
    submitQuizResult,
    getCourseProgress,
    notifications: currentUser ? notifications.filter(n => n.userId === currentUser.id) : [],
    unreadNotificationCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    conversations,
    messages,
    getConversationMessages,
    sendMessage,
    totalUnreadMessages,
    favorites,
    toggleFavorite,
    isFavorite,
    liveSessions,
    addLiveSession,
    updateLiveSession,
    discountCodes,
    addDiscountCode,
    validateDiscount,
    useDiscountCode,
    achievements,
    unlockAchievement,
    allUsers,
  }

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform() {
  const context = useContext(PlatformContext)
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider")
  }
  return context
}
