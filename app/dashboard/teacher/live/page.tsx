"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Radio,
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  Send,
  Settings,
  Hand,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function TeacherLivePage() {
  const [isLive, setIsLive] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [streamTitle, setStreamTitle] = useState("")
  const [streamCourse, setStreamCourse] = useState("web-dev")

  const chatMessages = [
    { id: 1, user: "Alex M.", message: "Hello everyone!", time: "Just now" },
    { id: 2, user: "Sara K.", message: "Ready for the session!", time: "Just now" },
    { id: 3, user: "John D.", message: "Thanks for the great content!", time: "1m" },
  ]

  const raisedHands = [
    { name: "Emily R.", time: "2 min ago" },
    { name: "Mark T.", time: "1 min ago" },
  ]

  if (!isLive) {
    return (
      <div className="p-4 lg:p-6">
        <Link
          href="/dashboard/teacher"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl bg-card p-8 shadow-sm">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
                <Radio className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Start Live Session</h1>
              <p className="mt-1 text-sm text-muted-foreground">Set up your live stream for students</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="streamTitle" className="mb-1.5 block text-sm font-medium text-muted-foreground">Session Title</label>
                <input
                  id="streamTitle"
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="e.g. React Hooks Live Q&A"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="streamCourse" className="mb-1.5 block text-sm font-medium text-muted-foreground">Course</label>
                <select
                  id="streamCourse"
                  value={streamCourse}
                  onChange={(e) => setStreamCourse(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="web-dev">Web Development Bootcamp</option>
                  <option value="data-science">Data Science Fundamentals</option>
                  <option value="all">All Students</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Preview</label>
                <div className="flex h-48 items-center justify-center rounded-xl bg-foreground">
                  <div className="text-center">
                    <Video className="mx-auto mb-2 h-8 w-8 text-card/40" />
                    <p className="text-sm text-card/60">Camera preview will appear here</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                    isMicOn ? "bg-muted text-foreground" : "bg-destructive text-destructive-foreground"
                  )}
                  aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCamOn(!isCamOn)}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                    isCamOn ? "bg-muted text-foreground" : "bg-destructive text-destructive-foreground"
                  )}
                  aria-label={isCamOn ? "Turn off camera" : "Turn on camera"}
                >
                  {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsLive(true)}
                disabled={!streamTitle.trim()}
                className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Go Live
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-4 p-4 lg:flex-row lg:p-6">
      {/* Main Stream Area */}
      <div className="flex flex-1 flex-col">
        <div className="relative flex flex-1 items-center justify-center rounded-2xl bg-foreground">
          <div className="text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                <Radio className="h-3 w-3 animate-pulse" />
                LIVE
              </span>
              <span className="flex items-center gap-1 rounded-full bg-card/10 px-3 py-1 text-xs text-card/70">
                <Users className="h-3 w-3" />
                342 watching
              </span>
              <span className="flex items-center gap-1 rounded-full bg-card/10 px-3 py-1 text-xs text-card/70">
                <Clock className="h-3 w-3" />
                25:42
              </span>
            </div>
            <h2 className="text-lg font-bold text-card">{streamTitle || "Live Session"}</h2>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isMicOn ? "bg-muted text-foreground" : "bg-destructive text-destructive-foreground"
              )}
              aria-label="Toggle mic"
            >
              {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsCamOn(!isCamOn)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isCamOn ? "bg-muted text-foreground" : "bg-destructive text-destructive-foreground"
              )}
              aria-label="Toggle camera"
            >
              {isCamOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isScreenSharing ? "bg-blue-500 text-white" : "bg-muted text-foreground"
              )}
              aria-label="Share screen"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsLive(false)}
            className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-bold text-white"
          >
            End Stream
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        {/* Raised Hands */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
            <Hand className="h-4 w-4 text-amber-500" />
            Raised Hands ({raisedHands.length})
          </h3>
          <div className="space-y-2">
            {raisedHands.map((hand) => (
              <div key={hand.name} className="flex items-center justify-between rounded-xl bg-muted p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                    {hand.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{hand.name}</p>
                    <p className="text-[10px] text-muted-foreground">{hand.time}</p>
                  </div>
                </div>
                <button type="button" className="rounded-lg bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
                  Allow
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-1 flex-col rounded-2xl bg-card shadow-sm">
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
                placeholder="Message your students..."
                className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
              />
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
