"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bell,
  BookOpen,
  Video,
  Tag,
  Radio,
  Award,
  MessageSquare,
  CheckCircle2,
  Clock,
  X,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: number
  type: "course" | "live" | "discount" | "achievement" | "message" | "update"
  title: string
  message: string
  time: string
  read: boolean
  link?: string
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "live",
    title: "Live Session Starting Soon",
    message: "React Hooks Deep Dive with Sarah Johnson starts in 30 minutes.",
    time: "30 min ago",
    read: false,
    link: "/dashboard/live",
  },
  {
    id: 2,
    type: "discount",
    title: "Special Offer!",
    message: "Get 50% off Advanced React Patterns. Use code WELCOME50.",
    time: "1h ago",
    read: false,
    link: "/dashboard/courses",
  },
  {
    id: 3,
    type: "course",
    title: "New Lesson Available",
    message: "CSS Grid lesson has been added to Web Development Bootcamp.",
    time: "2h ago",
    read: false,
    link: "/dashboard/courses/1",
  },
  {
    id: 4,
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "Congratulations! You earned the 'Quiz Master' badge.",
    time: "5h ago",
    read: true,
  },
  {
    id: 5,
    type: "message",
    title: "New Message from Sarah Johnson",
    message: "Great job on the last assignment! Keep it up.",
    time: "6h ago",
    read: true,
    link: "/dashboard/chats",
  },
  {
    id: 6,
    type: "update",
    title: "Course Updated",
    message: "Data Science Fundamentals has been updated with 3 new modules.",
    time: "1d ago",
    read: true,
    link: "/dashboard/courses/2",
  },
  {
    id: 7,
    type: "live",
    title: "Recording Available",
    message: "CSS Grid Masterclass recording is now available to watch.",
    time: "2d ago",
    read: true,
    link: "/dashboard/live",
  },
]

const notifIcon = (type: Notification["type"]) => {
  switch (type) {
    case "course": return { icon: BookOpen, color: "bg-blue-100 text-blue-600" }
    case "live": return { icon: Radio, color: "bg-red-100 text-red-600" }
    case "discount": return { icon: Tag, color: "bg-emerald-100 text-emerald-600" }
    case "achievement": return { icon: Award, color: "bg-amber-100 text-amber-600" }
    case "message": return { icon: MessageSquare, color: "bg-pink-100 text-pink-600" }
    case "update": return { icon: Video, color: "bg-purple-100 text-purple-600" }
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            filter === "unread" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <h3 className="font-heading text-lg font-semibold text-foreground">No notifications</h3>
            <p className="text-sm text-muted-foreground">You are all caught up!</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const { icon: Icon, color } = notifIcon(notif.type)
            return (
              <div
                key={notif.id}
                className={cn(
                  "group flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md",
                  !notif.read && "border-l-4 border-l-secondary"
                )}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                {notif.link ? (
                  <Link href={notif.link} className="min-w-0 flex-1" onClick={() => markAsRead(notif.id)}>
                    <div className="mb-0.5 flex items-center gap-2">
                      <h3 className={cn("text-sm font-semibold", notif.read ? "text-foreground" : "text-foreground")}>
                        {notif.title}
                      </h3>
                      {!notif.read && <div className="h-2 w-2 rounded-full bg-secondary" />}
                    </div>
                    <p className="mb-1 text-xs text-muted-foreground">{notif.message}</p>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {notif.time}
                    </span>
                  </Link>
                ) : (
                  <div className="min-w-0 flex-1" onClick={() => markAsRead(notif.id)}>
                    <div className="mb-0.5 flex items-center gap-2">
                      <h3 className={cn("text-sm font-semibold", notif.read ? "text-foreground" : "text-foreground")}>
                        {notif.title}
                      </h3>
                      {!notif.read && <div className="h-2 w-2 rounded-full bg-secondary" />}
                    </div>
                    <p className="mb-1 text-xs text-muted-foreground">{notif.message}</p>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {notif.time}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(notif.id)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
