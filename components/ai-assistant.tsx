"use client"

import { useState, useRef, useEffect } from "react"
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Search,
  Lightbulb,
  Bot,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  role: "assistant" | "user"
  content: string
  timestamp: Date
}

const suggestions = [
  { icon: BookOpen, text: "Recommend courses for web development" },
  { icon: HelpCircle, text: "Explain React hooks to me" },
  { icon: TrendingUp, text: "How can I improve my learning pace?" },
  { icon: Search, text: "Find courses about machine learning" },
]

const quickResponses: Record<string, string> = {
  "recommend courses": "Based on your learning history, I recommend:\n\n1. **React Advanced Patterns** - Since you're 65% through the Web Dev Bootcamp, this would be a great next step.\n\n2. **TypeScript Fundamentals** - This pairs well with your current JavaScript knowledge.\n\n3. **Node.js Backend Development** - Complete your full-stack journey.\n\nWould you like me to enroll you in any of these?",
  "explain react hooks": "**React Hooks** are functions that let you use state and lifecycle features in functional components:\n\n- **useState** - Add state to components\n- **useEffect** - Handle side effects (API calls, subscriptions)\n- **useContext** - Access context values\n- **useMemo** - Memoize expensive computations\n- **useCallback** - Memoize callback functions\n\nYou covered this in Lesson 17 of your Web Dev Bootcamp. Want me to take you back to that lesson?",
  "improve learning": "Here are personalized tips based on your activity:\n\n1. **Set a consistent schedule** - You learn best on Saturdays (4h). Try adding 1h daily sessions.\n\n2. **Complete quizzes immediately** - You retain 40% more when you quiz right after watching.\n\n3. **Take notes** - Your CSS Grid notes helped you score 100% on that quiz!\n\n4. **Join study groups** - The Web Dev study group is active in your Chats.\n\nYour current streak is 12 days. Keep it going!",
  "find courses": "Here are the top Machine Learning courses on EduPlatform:\n\n1. **Machine Learning with Python** - Dr. Wei Zhang (4.9 stars, 11.2k students) - $79.99\n\n2. **Data Science Fundamentals** - Ahmed Hassan (4.9 stars) - You're already enrolled! 30% complete.\n\n3. **Deep Learning Specialization** - Coming soon!\n\nWant me to show you more details or help you enroll?",
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Hi! I'm your AI learning assistant. I can help you find courses, explain concepts, track your progress, and more. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response with smart matching
    setTimeout(() => {
      const lowerMsg = messageText.toLowerCase()
      let response = "I understand your question. Let me help you with that.\n\nBased on your current courses and progress, I'd suggest exploring the course catalog for related topics. You can also check the Live Sessions page for upcoming interactive classes.\n\nIs there anything specific you'd like to know more about?"

      for (const [key, value] of Object.entries(quickResponses)) {
        if (lowerMsg.includes(key)) {
          response = value
          break
        }
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    )
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-secondary" />
          AI Assistant
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setIsMinimized(false) }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-muted-foreground shadow-lg"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <p className="text-[10px] text-white/60">Powered by AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setIsMinimized(true)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:text-white" aria-label="Minimize">
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:text-white" aria-label="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full",
                msg.role === "assistant" ? "bg-gradient-to-br from-secondary to-accent" : "bg-primary"
              )}>
                {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5 text-white" /> : <User className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-3.5 py-2.5",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              )}>
                <p className="whitespace-pre-wrap text-xs leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-accent">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions - only show when few messages */}
        {messages.length <= 1 && (
          <div className="mt-4 space-y-2">
            {suggestions.map((sug) => (
              <button
                key={sug.text}
                type="button"
                onClick={() => sendMessage(sug.text)}
                className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <sug.icon className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />
                {sug.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
