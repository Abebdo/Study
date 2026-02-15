"use client"

import { use, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Video,
  HelpCircle,
  FileText,
  GripVertical,
  Trash2,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  Upload,
  ImageIcon as ImageIcon,
  Sparkles,
  Eye,
  Settings,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ContentTab = "content" | "settings" | "quiz"

type LessonType = "video" | "quiz" | "exercise"

interface LessonItem {
  id: number
  title: string
  type: LessonType
  duration: string
  videoUrl: string
}

interface ModuleItem {
  id: number
  title: string
  expanded: boolean
  lessons: LessonItem[]
}

interface QuizOption {
  text: string
  correct: boolean
}

interface QuizQuestion {
  id: number
  question: string
  image: string | null
  options: QuizOption[]
}

const initialModules: ModuleItem[] = [

  {
    id: 1,
    title: "Getting Started with HTML",
    expanded: true,
    lessons: [
      { id: 1, title: "Introduction to HTML", type: "video" as const, duration: "15 min", videoUrl: "" },
      { id: 2, title: "HTML Elements & Structure", type: "video" as const, duration: "22 min", videoUrl: "" },
      { id: 3, title: "HTML Quiz", type: "quiz" as const, duration: "10 min", videoUrl: "" },
    ],
  },
  {
    id: 2,
    title: "CSS Fundamentals",
    expanded: false,
    lessons: [
      { id: 4, title: "CSS Selectors & Properties", type: "video" as const, duration: "20 min", videoUrl: "" },
      { id: 5, title: "Flexbox Layout", type: "video" as const, duration: "25 min", videoUrl: "" },
      { id: 6, title: "CSS Challenge", type: "exercise" as const, duration: "30 min", videoUrl: "" },
    ],
  },
]

const initialQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What does HTML stand for?",
    image: null as string | null,
    options: [
      { text: "Hyper Text Markup Language", correct: true },
      { text: "High Tech Modern Language", correct: false },
      { text: "Hyper Transfer Markup Language", correct: false },
      { text: "Home Tool Markup Language", correct: false },
    ],
  },
  {
    id: 2,
    question: "Which tag is used for creating a hyperlink?",
    image: null as string | null,
    options: [
      { text: "<link>", correct: false },
      { text: "<a>", correct: true },
      { text: "<href>", correct: false },
      { text: "<url>", correct: false },
    ],
  },
]

export default function CourseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<ContentTab>("content")
  const [modules, setModules] = useState<ModuleItem[]>(initialModules)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(initialQuizQuestions)
  const [showAddLesson, setShowAddLesson] = useState<number | null>(null)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [newLessonType, setNewLessonType] = useState<LessonType>("video")
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null)

  const toggleModule = (moduleId: number) => {
    setModules(prev =>
      prev.map(m => m.id === moduleId ? { ...m, expanded: !m.expanded } : m)
    )
  }

  const addLesson = (moduleId: number) => {
    if (!newLessonTitle.trim()) return
    setModules(prev =>
      prev.map(m => {
        if (m.id === moduleId) {
          return {
            ...m,
            lessons: [
              ...m.lessons,
              { id: Date.now(), title: newLessonTitle, type: newLessonType, duration: "0 min", videoUrl: "" },
            ],
          }
        }
        return m
      })
    )
    setNewLessonTitle("")
    setShowAddLesson(null)
  }

  const removeLesson = (moduleId: number, lessonId: number) => {
    setModules(prev =>
      prev.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
        }
        return m
      })
    )
  }

  const addModule = () => {
    setModules(prev => [...prev, {
      id: Date.now(),
      title: "New Module",
      expanded: true,
      lessons: [],
    }])
  }

  const addQuestion = () => {
    setQuizQuestions(prev => [...prev, {
      id: Date.now(),
      question: "",
      image: null,
      options: [
        { text: "", correct: true },
        { text: "", correct: false },
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    }])
    setShowAddQuestion(false)
  }

  const removeQuestion = (qId: number) => {
    setQuizQuestions(prev => prev.filter(q => q.id !== qId))
  }

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4 text-blue-500" />
      case "quiz": return <HelpCircle className="h-4 w-4 text-amber-500" />
      case "exercise": return <FileText className="h-4 w-4 text-emerald-500" />
      default: return <Video className="h-4 w-4 text-blue-500" />
    }
  }

  const tabs = [
    { id: "content" as ContentTab, label: "Course Content", icon: Video },
    { id: "quiz" as ContentTab, label: "Quizzes", icon: HelpCircle },
    { id: "settings" as ContentTab, label: "Settings", icon: Settings },
  ]

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/teacher"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              Edit: Web Development Bootcamp
            </h1>
            <p className="text-xs text-muted-foreground">Course ID: {id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button type="button" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
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
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-4">
          {modules.map((mod) => (
            <div key={mod.id} className="overflow-hidden rounded-2xl bg-card shadow-sm">
              <button
                type="button"
                onClick={() => toggleModule(mod.id)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  {mod.expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm font-semibold text-foreground">{mod.title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{mod.lessons.length} lessons</span>
                </div>
                <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>

              {mod.expanded && (
                <div className="border-t border-border">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-b-0">
                      <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-muted-foreground/30" />
                      {lessonIcon(lesson.type)}
                      <span className="flex-1 text-sm text-foreground">{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                      {lesson.type === "video" && (
                        <button type="button" className="flex h-8 items-center gap-1 rounded-lg bg-muted px-2 text-xs text-muted-foreground hover:text-foreground">
                          <Upload className="h-3 w-3" />
                          Upload
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeLesson(mod.id, lesson.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove lesson"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Lesson */}
                  {showAddLesson === mod.id ? (
                    <div className="flex items-center gap-2 border-t border-border p-3">
                      <input
                        type="text"
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="Lesson title..."
                        className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                        autoFocus
                      />
                      <select
                        value={newLessonType}
                        onChange={(e) => setNewLessonType(e.target.value as "video" | "quiz" | "exercise")}
                        className="appearance-none rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none"
                      >
                        <option value="video">Video</option>
                        <option value="quiz">Quiz</option>
                        <option value="exercise">Exercise</option>
                      </select>
                      <button type="button" onClick={() => addLesson(mod.id)} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Add</button>
                      <button type="button" onClick={() => setShowAddLesson(null)} className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddLesson(mod.id)}
                      className="flex w-full items-center justify-center gap-2 border-t border-border p-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Lesson
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addModule}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add New Module
          </button>
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === "quiz" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{quizQuestions.length} questions total</p>
            <div className="flex items-center gap-2">
              <button type="button" className="flex items-center gap-2 rounded-xl border border-dashed border-secondary bg-secondary/5 px-4 py-2.5 text-sm font-medium text-secondary">
                <Sparkles className="h-4 w-4" />
                AI Generate Questions
              </button>
              <button type="button" onClick={addQuestion} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>
          </div>

          {quizQuestions.map((q, qIndex) => (
            <div key={q.id} className="rounded-2xl bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">{qIndex + 1}</span>
                <button type="button" onClick={() => removeQuestion(q.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Remove question">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                defaultValue={q.question}
                placeholder="Enter your question..."
                className="mb-3 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-primary"
              />
              {/* Image upload for question */}
              <div className="mb-3">
                <button type="button" className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Add Image to Question
                </button>
              </div>
              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <button
                      type="button"
                      className={cn(
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        opt.correct ? "border-emerald-500 bg-emerald-500 text-white" : "border-border text-muted-foreground hover:border-emerald-300"
                      )}
                    >
                      {opt.correct && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="text"
                      defaultValue={opt.text}
                      placeholder={`Option ${optIndex + 1}...`}
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">Course Settings</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="editTitle" className="mb-1.5 block text-sm font-medium text-muted-foreground">Course Title</label>
                <input id="editTitle" type="text" defaultValue="Web Development Bootcamp" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div>
                <label htmlFor="editDesc" className="mb-1.5 block text-sm font-medium text-muted-foreground">Description</label>
                <textarea id="editDesc" rows={4} defaultValue="From HTML basics to full-stack JavaScript applications with React and Node.js" className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editPrice" className="mb-1.5 block text-sm font-medium text-muted-foreground">Price ($)</label>
                  <input id="editPrice" type="number" defaultValue="49.99" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label htmlFor="editOrigPrice" className="mb-1.5 block text-sm font-medium text-muted-foreground">Original Price ($)</label>
                  <input id="editOrigPrice" type="number" defaultValue="199.99" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Cover Image</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-24 w-40 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-2xl font-bold text-white">WD</div>
                  <div className="flex flex-col gap-2">
                    <button type="button" className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/80">
                      <Upload className="h-3.5 w-3.5" />
                      Upload Image
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-lg border border-dashed border-secondary bg-secondary/5 px-3 py-2 text-xs font-medium text-secondary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate with AI
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="editVisibility" className="mb-1.5 block text-sm font-medium text-muted-foreground">Visibility</label>
                <select id="editVisibility" className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary">
                  <option>Published - Visible to everyone</option>
                  <option>Draft - Only visible to you</option>
                  <option>Unlisted - Only accessible via link</option>
                </select>
              </div>
              <button type="button" className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                <Save className="h-4 w-4" />
                Save Settings
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-sm">
            <h2 className="mb-2 font-heading text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="mb-4 text-sm text-muted-foreground">Once you delete a course, there is no going back.</p>
            <button type="button" className="rounded-xl bg-destructive px-6 py-3 text-sm font-semibold text-destructive-foreground">
              Delete Course
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
