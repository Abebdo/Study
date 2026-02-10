"use client"

import { use, useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  MessageSquare,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  Code,
  Video,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Award,
  ThumbsUp,
  Bookmark,
  PlayCircle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type QuizState = "idle" | "taking" | "results"

const lessonData = {
  id: 1,
  title: "CSS Grid",
  description: "Learn the fundamentals of CSS Grid layout system, including grid containers, grid items, grid lines, tracks, and areas. Master responsive layouts with CSS Grid.",
  duration: "22 min",
  type: "video" as const,
  moduleTitle: "CSS Fundamentals",
  courseName: "Web Development Bootcamp",
}

const sidebarLessons = [
  { id: 1, title: "Introduction to HTML", type: "video", completed: true, duration: "15 min" },
  { id: 2, title: "HTML Elements & Structure", type: "video", completed: true, duration: "22 min" },
  { id: 3, title: "Forms & Input Elements", type: "video", completed: true, duration: "18 min" },
  { id: 4, title: "HTML Quiz", type: "quiz", completed: true, duration: "10 min" },
  { id: 5, title: "CSS Selectors & Properties", type: "video", completed: true, duration: "20 min" },
  { id: 6, title: "Flexbox Layout", type: "video", completed: true, duration: "25 min" },
  { id: 7, title: "CSS Grid", type: "video", completed: false, duration: "22 min", current: true },
  { id: 8, title: "Responsive Design", type: "video", completed: false, duration: "28 min" },
  { id: 9, title: "CSS Challenge", type: "exercise", completed: false, duration: "30 min" },
  { id: 10, title: "Variables & Data Types", type: "video", completed: false, duration: "18 min" },
]

const quizData = [
  {
    id: 1,
    question: "Which CSS property creates a grid container?",
    image: null as string | null,
    options: [
      { text: "display: grid", correct: true },
      { text: "display: flex", correct: false },
      { text: "display: block", correct: false },
      { text: "display: inline-grid", correct: false },
    ],
  },
  {
    id: 2,
    question: "What does 'grid-template-columns: repeat(3, 1fr)' create?",
    image: null as string | null,
    options: [
      { text: "3 rows of equal width", correct: false },
      { text: "3 columns of equal width", correct: true },
      { text: "3 items in the grid", correct: false },
      { text: "A 3x3 grid", correct: false },
    ],
  },
  {
    id: 3,
    question: "Which property controls spacing between grid items?",
    image: null as string | null,
    options: [
      { text: "margin", correct: false },
      { text: "padding", correct: false },
      { text: "gap", correct: true },
      { text: "spacing", correct: false },
    ],
  },
]

const notesList = [
  { time: "2:15", text: "Grid container needs display: grid" },
  { time: "5:30", text: "Use fr units for flexible columns" },
  { time: "8:45", text: "grid-template-areas for named layouts" },
]

export default function LessonPlayerPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>
}) {
  const { id, lessonId } = use(params)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(35)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activePanel, setActivePanel] = useState<"lessons" | "notes" | "quiz">("lessons")
  const [quizState, setQuizState] = useState<QuizState>("idle")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(quizData.length).fill(null))
  const [quizScore, setQuizScore] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Simulate video progress
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 100
          }
          return prev + 0.5
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const submitQuiz = () => {
    let score = 0
    quizData.forEach((q, i) => {
      if (selectedAnswers[i] !== null && q.options[selectedAnswers[i]!].correct) {
        score++
      }
    })
    setQuizScore(score)
    setQuizState("results")
  }

  const resetQuiz = () => {
    setSelectedAnswers(new Array(quizData.length).fill(null))
    setCurrentQuestion(0)
    setQuizState("idle")
    setQuizScore(0)
  }

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video": return <PlayCircle className="h-3.5 w-3.5" />
      case "quiz": return <HelpCircle className="h-3.5 w-3.5" />
      case "exercise": return <Code className="h-3.5 w-3.5" />
      default: return <PlayCircle className="h-3.5 w-3.5" />
    }
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col lg:flex-row">
      {/* Main Video Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/courses/${id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-foreground">{lessonData.title}</h1>
              <p className="text-xs text-muted-foreground">{lessonData.courseName} - {lessonData.moduleTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors", isLiked ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted")}
              aria-label="Like"
            >
              <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors", isBookmarked ? "bg-secondary/10 text-secondary" : "text-muted-foreground hover:bg-muted")}
              aria-label="Bookmark"
            >
              <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            </button>
            <button
              type="button"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex h-8 items-center gap-1 rounded-lg bg-muted px-2 text-xs text-muted-foreground hover:text-foreground lg:hidden"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Lessons
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative flex flex-1 items-center justify-center bg-foreground">
          {/* Simulated video area */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card/10">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-card/20 text-card backdrop-blur-sm transition-transform hover:scale-110"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
              </button>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-card">{lessonData.title}</p>
              <p className="text-sm text-card/60">{lessonData.description}</p>
            </div>
          </div>

          {/* Video Controls */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3 group cursor-pointer">
              <div className="h-1.5 overflow-hidden rounded-full bg-card/20 transition-all group-hover:h-2.5">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button type="button" className="text-card/80 hover:text-card" aria-label="Previous"><SkipBack className="h-4 w-4" /></button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-card/20 text-card backdrop-blur-sm"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
                </button>
                <button type="button" className="text-card/80 hover:text-card" aria-label="Next"><SkipForward className="h-4 w-4" /></button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-card/80 hover:text-card"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="text-xs text-card/60">{Math.floor(progress * 22 / 100)}:{String(Math.floor((progress * 22 * 60 / 100) % 60)).padStart(2, "0")} / 22:00</span>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="text-card/80 hover:text-card" aria-label="Settings"><Settings className="h-4 w-4" /></button>
                <button type="button" className="text-card/80 hover:text-card" aria-label="Fullscreen"><Maximize className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Below Video: Info + Actions */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground">{lessonData.title}</h2>
              <p className="text-xs text-muted-foreground">{lessonData.moduleTitle} - {lessonData.duration}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/courses/${id}/lesson/6`}
                className="flex h-8 items-center gap-1 rounded-lg bg-muted px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
              </Link>
              <button
                type="button"
                className="flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </button>
              <Link
                href={`/dashboard/courses/${id}/lesson/8`}
                className="flex h-8 items-center gap-1 rounded-lg bg-muted px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {showSidebar && (
        <div className="flex w-full flex-col border-l border-border bg-card lg:w-80">
          {/* Panel Tabs */}
          <div className="flex border-b border-border">
            {[
              { id: "lessons" as const, label: "Lessons", icon: BookOpen },
              { id: "notes" as const, label: "Notes", icon: FileText },
              { id: "quiz" as const, label: "Quiz", icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePanel(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors",
                  activePanel === tab.id
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lessons Panel */}
          {activePanel === "lessons" && (
            <div className="flex-1 overflow-y-auto">
              {sidebarLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/dashboard/courses/${id}/lesson/${lesson.id}`}
                  className={cn(
                    "flex items-center gap-3 border-b border-border/50 px-4 py-3 transition-colors",
                    lesson.current ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-muted/50"
                  )}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                  ) : lesson.current ? (
                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary">
                      <Play className="h-2 w-2 text-primary-foreground" />
                    </div>
                  ) : (
                    <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {lessonIcon(lesson.type)}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-xs", lesson.current ? "font-semibold text-foreground" : lesson.completed ? "text-muted-foreground" : "text-foreground")}>
                      {lesson.title}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Notes Panel */}
          {activePanel === "notes" && (
            <div className="flex flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {notesList.map((note) => (
                    <div key={note.time} className="flex gap-3 rounded-xl bg-muted p-3">
                      <span className="flex-shrink-0 rounded-lg bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">{note.time}</span>
                      <p className="text-xs text-foreground">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a note at current time..."
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                  />
                  <button type="button" className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Panel */}
          {activePanel === "quiz" && (
            <div className="flex flex-1 flex-col">
              {quizState === "idle" && (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
                    <HelpCircle className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="mb-2 font-heading text-sm font-semibold text-foreground">Lesson Quiz</h3>
                  <p className="mb-4 text-xs text-muted-foreground">{quizData.length} questions to test your knowledge about {lessonData.title}</p>
                  <button
                    type="button"
                    onClick={() => setQuizState("taking")}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Start Quiz
                  </button>
                </div>
              )}

              {quizState === "taking" && (
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Question {currentQuestion + 1} of {quizData.length}</span>
                    <div className="flex gap-1">
                      {quizData.map((_, i) => (
                        <div key={i} className={cn("h-2 w-6 rounded-full", i === currentQuestion ? "bg-primary" : selectedAnswers[i] !== null ? "bg-emerald-400" : "bg-muted")} />
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">{quizData[currentQuestion].question}</h3>
                    <div className="space-y-2">
                      {quizData[currentQuestion].options.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectAnswer(i)}
                          className={cn(
                            "w-full rounded-xl border p-3 text-left text-xs transition-all",
                            selectedAnswers[currentQuestion] === i
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          )}
                        >
                          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px]">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs text-muted-foreground disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </button>
                    {currentQuestion === quizData.length - 1 ? (
                      <button
                        type="button"
                        onClick={submitQuiz}
                        disabled={selectedAnswers.some(a => a === null)}
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => prev + 1)}
                        className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {quizState === "results" && (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <div className={cn(
                    "mb-4 flex h-20 w-20 items-center justify-center rounded-full",
                    quizScore >= quizData.length * 0.7 ? "bg-emerald-100" : "bg-amber-100"
                  )}>
                    <Award className={cn("h-10 w-10", quizScore >= quizData.length * 0.7 ? "text-emerald-600" : "text-amber-600")} />
                  </div>
                  <h3 className="mb-1 font-heading text-lg font-bold text-foreground">
                    {quizScore >= quizData.length * 0.7 ? "Great Job!" : "Keep Trying!"}
                  </h3>
                  <p className="mb-2 text-2xl font-bold text-foreground">{quizScore}/{quizData.length}</p>
                  <p className="mb-6 text-xs text-muted-foreground">
                    {quizScore >= quizData.length * 0.7 ? "You passed the quiz. Well done!" : "Review the lesson and try again."}
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={resetQuiz} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                      Retry
                    </button>
                    <button type="button" onClick={() => { setActivePanel("lessons"); resetQuiz() }} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
