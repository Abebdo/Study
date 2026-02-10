"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Radio,
  Users,
  Clock,
  MessageSquare,
  Send,
  ThumbsUp,
  Hand,
  Calendar,
  Play,
  Eye,
  Star,
  Bell,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const liveNow = [
  {
    id: 1,
    title: "React Hooks Deep Dive - Live Q&A",
    instructor: "Sarah Johnson",
    course: "Web Development Bootcamp",
    viewers: 342,
    startedAt: "25 min ago",
    color: "from-blue-500 to-blue-700",
  },
]

const upcomingSessions = [
  {
    id: 2,
    title: "Data Visualization with Python",
    instructor: "Ahmed Hassan",
    course: "Data Science Fundamentals",
    date: "Today, 5:00 PM",
    attendees: 128,
    color: "from-emerald-500 to-emerald-700",
  },
  {
    id: 3,
    title: "Portfolio Design Workshop",
    instructor: "Maria Garcia",
    course: "UI/UX Design Mastery",
    date: "Tomorrow, 3:00 PM",
    attendees: 95,
    color: "from-pink-500 to-pink-700",
  },
  {
    id: 4,
    title: "Calculus Problem Solving",
    instructor: "Dr. Emily Watson",
    course: "Advanced Mathematics",
    date: "Feb 13, 10:00 AM",
    attendees: 210,
    color: "from-purple-500 to-purple-700",
  },
]

const pastSessions = [
  {
    id: 5,
    title: "CSS Grid Masterclass",
    instructor: "Sarah Johnson",
    duration: "1h 32m",
    viewers: 567,
    rating: 4.9,
    color: "from-blue-500 to-blue-700",
  },
  {
    id: 6,
    title: "Machine Learning Basics",
    instructor: "Ahmed Hassan",
    duration: "2h 15m",
    viewers: 890,
    rating: 4.8,
    color: "from-emerald-500 to-emerald-700",
  },
]

const chatMessages = [
  { id: 1, user: "Alex M.", message: "Great explanation of useEffect!", time: "2 min ago" },
  { id: 2, user: "Sara K.", message: "Can you show the dependency array again?", time: "1 min ago" },
  { id: 3, user: "John D.", message: "This is so helpful, thanks!", time: "30s ago" },
  { id: 4, user: "Emily R.", message: "What about useCallback vs useMemo?", time: "10s ago" },
]

type Tab = "live" | "upcoming" | "recordings"

export default function LiveStreamingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("live")
  const [chatInput, setChatInput] = useState("")
  const [isWatching, setIsWatching] = useState(false)
  const [handRaised, setHandRaised] = useState(false)

  return (
    <div className="p-4 lg:p-6">
      {!isWatching ? (
        <>
          {/* Header */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-foreground">Live Sessions</h1>
            <p className="text-sm text-muted-foreground">Watch live classes and recordings from your instructors</p>
          </div>

          {/* Live Now Banner */}
          {liveNow.length > 0 && (
            <div className="mb-6">
              {liveNow.map((session) => (
                <div key={session.id} className="relative overflow-hidden rounded-2xl bg-primary p-6">
                  <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                          <Radio className="h-3 w-3 animate-pulse" />
                          LIVE NOW
                        </span>
                        <span className="flex items-center gap-1 text-xs text-primary-foreground/70">
                          <Users className="h-3 w-3" />
                          {session.viewers} watching
                        </span>
                      </div>
                      <h2 className="mb-1 font-heading text-xl font-bold text-primary-foreground">{session.title}</h2>
                      <p className="text-sm text-primary-foreground/70">{session.instructor} - {session.course}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-primary-foreground/50">
                        <Clock className="h-3 w-3" />
                        Started {session.startedAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsWatching(true)}
                      className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-105"
                    >
                      <Play className="h-4 w-4" />
                      Join Live
                    </button>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-secondary/10" />
                  <div className="absolute -bottom-6 right-24 h-20 w-20 rounded-full bg-accent/10" />
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-border">
            {[
              { id: "upcoming" as Tab, label: "Upcoming", count: upcomingSessions.length },
              { id: "recordings" as Tab, label: "Recordings", count: pastSessions.length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Upcoming Sessions */}
          {activeTab === "upcoming" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:shadow-md">
                  <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${session.color}`}>
                    <Calendar className="h-8 w-8 text-white/80" />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 font-heading text-sm font-semibold text-foreground">{session.title}</h3>
                    <p className="mb-2 text-xs text-muted-foreground">{session.instructor} - {session.course}</p>
                    <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{session.attendees} registered</span>
                    </div>
                    <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground">
                      <Bell className="h-3.5 w-3.5" />
                      Set Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recordings */}
          {activeTab === "recordings" && (
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-sm transition-all hover:shadow-md">
                  <div className={`flex h-16 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${session.color}`}>
                    <Play className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-foreground">{session.title}</h3>
                    <p className="text-xs text-muted-foreground">{session.instructor}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.duration}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{session.viewers} views</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{session.rating}</span>
                    </div>
                  </div>
                  <button type="button" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">
                    <Play className="h-3.5 w-3.5" />
                    Watch
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Live Stream Viewer */
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 lg:flex-row">
          {/* Stream */}
          <div className="flex flex-1 flex-col">
            <div className="relative flex flex-1 items-center justify-center rounded-2xl bg-foreground">
              <div className="text-center">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                    <Radio className="h-3 w-3 animate-pulse" />
                    LIVE
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-card/10 px-3 py-1 text-xs text-card/70">
                    <Users className="h-3 w-3" />
                    342 watching
                  </span>
                </div>
                <h2 className="text-xl font-bold text-card">React Hooks Deep Dive - Live Q&A</h2>
                <p className="mt-1 text-sm text-card/60">Sarah Johnson</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
              <div>
                <h3 className="font-heading text-sm font-semibold text-foreground">React Hooks Deep Dive</h3>
                <p className="text-xs text-muted-foreground">Sarah Johnson - Web Development Bootcamp</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHandRaised(!handRaised)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    handRaised ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Raise hand"
                >
                  <Hand className="h-4 w-4" />
                </button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-foreground" aria-label="Like">
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsWatching(false)}
                  className="rounded-xl bg-destructive px-4 py-2.5 text-xs font-semibold text-destructive-foreground"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="flex w-full flex-col rounded-2xl bg-card shadow-sm lg:w-80">
            <div className="border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="rounded-xl bg-muted p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{msg.user}</span>
                      <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                />
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
