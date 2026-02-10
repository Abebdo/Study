"use client"

import { useState } from "react"
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const conversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Instructor",
    lastMessage: "Great job on the last assignment! Keep it up.",
    time: "2 min",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Study Group - Web Dev",
    role: "Group",
    lastMessage: "Does anyone have notes for the React module?",
    time: "15 min",
    unread: 5,
    online: false,
  },
  {
    id: 3,
    name: "Ahmed Hassan",
    role: "Instructor",
    lastMessage: "The next live session is on Thursday at 5 PM.",
    time: "1h",
    unread: 0,
    online: true,
  },
  {
    id: 4,
    name: "Maria Garcia",
    role: "Instructor",
    lastMessage: "Your design project has been reviewed.",
    time: "3h",
    unread: 1,
    online: false,
  },
  {
    id: 5,
    name: "Jeffrey Clint",
    role: "Classmate",
    lastMessage: "Want to work together on the CSS challenge?",
    time: "1d",
    unread: 0,
    online: false,
  },
]

const messages = [
  {
    id: 1,
    sender: "Sarah Johnson",
    content:
      "Hi Ronald! I just reviewed your latest project submission for the Web Development course.",
    time: "10:30 AM",
    isMe: false,
  },
  {
    id: 2,
    sender: "Me",
    content: "Thanks, Sarah! I worked really hard on the React components part.",
    time: "10:32 AM",
    isMe: true,
  },
  {
    id: 3,
    sender: "Sarah Johnson",
    content:
      "I can tell! Your component structure is very clean and well-organized. The state management approach is excellent.",
    time: "10:35 AM",
    isMe: false,
  },
  {
    id: 4,
    sender: "Me",
    content: "That means a lot coming from you! Any areas for improvement?",
    time: "10:36 AM",
    isMe: true,
  },
  {
    id: 5,
    sender: "Sarah Johnson",
    content:
      "Just a small suggestion - try to add more error handling in your API calls. Also, consider using custom hooks to abstract shared logic. Overall great work!",
    time: "10:40 AM",
    isMe: false,
  },
  {
    id: 6,
    sender: "Sarah Johnson",
    content: "Great job on the last assignment! Keep it up.",
    time: "10:42 AM",
    isMe: false,
  },
]

export default function ChatsPage() {
  const [selectedConversation, setSelectedConversation] = useState(
    conversations[0]
  )
  const [messageInput, setMessageInput] = useState("")
  const [showChat, setShowChat] = useState(false)

  const selectConversation = (conv: (typeof conversations)[0]) => {
    setSelectedConversation(conv)
    setShowChat(true)
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-0 p-4 lg:p-6">
      {/* Conversations List */}
      <div
        className={cn(
          "flex w-full flex-col rounded-l-2xl bg-card shadow-sm lg:w-80",
          showChat ? "hidden lg:flex" : "flex"
        )}
      >
        <div className="border-b border-border p-4">
          <h1 className="mb-3 font-heading text-xl font-bold text-foreground">
            Chats
          </h1>
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => selectConversation(conv)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted",
                selectedConversation.id === conv.id && "bg-muted"
              )}
            >
              <div className="relative flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                  {conv.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                {conv.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="truncate text-sm font-medium text-foreground">
                    {conv.name}
                  </h3>
                  <span className="flex-shrink-0 text-xs text-muted-foreground">
                    {conv.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex flex-1 flex-col rounded-r-2xl bg-card shadow-sm",
          !showChat ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowChat(false)}
              className="lg:hidden"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-semibold text-foreground">
                {selectedConversation.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              {selectedConversation.online && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-400" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {selectedConversation.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.online ? "Online" : "Offline"} -{" "}
                {selectedConversation.role}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Voice call"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Video call"
            >
              <Video className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.isMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    msg.isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      msg.isMe
                        ? "text-primary-foreground/60"
                        : "text-muted-foreground"
                    )}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
