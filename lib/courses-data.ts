export interface Course {
  id: number
  title: string
  description: string
  instructor: string
  institution: string
  category: string
  rating: number
  students: number
  duration: string
  lessons: number
  level: "Beginner" | "Intermediate" | "Advanced"
  price: number
  originalPrice?: number
  color: string
  icon: string
  isFavorite?: boolean
  progress?: number
}

export interface Lesson {
  id: number
  title: string
  duration: string
  type: "video" | "quiz" | "exercise" | "reading"
  completed: boolean
}

export interface CourseDetail extends Course {
  longDescription: string
  whatYouLearn: string[]
  modules: {
    title: string
    lessons: Lesson[]
  }[]
}

export const allCourses: Course[] = [
  {
    id: 1,
    title: "Web Development Bootcamp",
    description:
      "From HTML basics to full-stack JavaScript applications with React and Node.js",
    instructor: "Sarah Johnson",
    institution: "Tech Academy",
    category: "Programming",
    rating: 4.8,
    students: 12500,
    duration: "42h",
    lessons: 156,
    level: "Beginner",
    price: 49.99,
    originalPrice: 199.99,
    color: "from-blue-500 to-blue-700",
    icon: "WD",
    progress: 65,
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    description:
      "Learn Python, statistics, and machine learning basics with hands-on projects",
    instructor: "Ahmed Hassan",
    institution: "DataSchool",
    category: "Programming",
    rating: 4.9,
    students: 8900,
    duration: "38h",
    lessons: 128,
    level: "Intermediate",
    price: 59.99,
    originalPrice: 249.99,
    color: "from-emerald-500 to-emerald-700",
    icon: "DS",
    progress: 30,
  },
  {
    id: 3,
    title: "UI/UX Design Mastery",
    description:
      "Design beautiful interfaces with modern design principles and Figma",
    instructor: "Maria Garcia",
    institution: "Design Institute",
    category: "Design",
    rating: 4.7,
    students: 6700,
    duration: "28h",
    lessons: 92,
    level: "Beginner",
    price: 39.99,
    originalPrice: 159.99,
    color: "from-pink-500 to-pink-700",
    icon: "UX",
  },
  {
    id: 4,
    title: "Mobile App Development",
    description: "Build iOS and Android apps with React Native from scratch",
    instructor: "James Chen",
    institution: "Mobile Academy",
    category: "Programming",
    rating: 4.6,
    students: 5200,
    duration: "35h",
    lessons: 118,
    level: "Intermediate",
    price: 54.99,
    originalPrice: 219.99,
    color: "from-amber-500 to-amber-700",
    icon: "MA",
  },
  {
    id: 5,
    title: "Advanced Mathematics",
    description:
      "Calculus, linear algebra, and probability for engineering students",
    instructor: "Dr. Emily Watson",
    institution: "MIT Open",
    category: "Mathematics",
    rating: 4.9,
    students: 15600,
    duration: "56h",
    lessons: 200,
    level: "Advanced",
    price: 69.99,
    originalPrice: 299.99,
    color: "from-purple-500 to-purple-700",
    icon: "AM",
  },
  {
    id: 6,
    title: "English for Business",
    description:
      "Professional English communication, writing, and presentation skills",
    instructor: "David Miller",
    institution: "Language Hub",
    category: "Languages",
    rating: 4.5,
    students: 9800,
    duration: "24h",
    lessons: 80,
    level: "Beginner",
    price: 29.99,
    originalPrice: 119.99,
    color: "from-teal-500 to-teal-700",
    icon: "EB",
  },
  {
    id: 7,
    title: "Physics: Mechanics & Waves",
    description:
      "Classical mechanics, thermodynamics, and wave phenomena explained simply",
    instructor: "Prof. Robert Kim",
    institution: "ScienceHub",
    category: "Science",
    rating: 4.7,
    students: 4300,
    duration: "32h",
    lessons: 110,
    level: "Intermediate",
    price: 44.99,
    originalPrice: 179.99,
    color: "from-indigo-500 to-indigo-700",
    icon: "PH",
  },
  {
    id: 8,
    title: "Digital Photography",
    description:
      "Master camera settings, composition, and photo editing with Lightroom",
    instructor: "Lisa Park",
    institution: "Creative Arts",
    category: "Photography",
    rating: 4.8,
    students: 7100,
    duration: "20h",
    lessons: 68,
    level: "Beginner",
    price: 34.99,
    originalPrice: 139.99,
    color: "from-orange-500 to-orange-700",
    icon: "DP",
  },
  {
    id: 9,
    title: "Music Theory Complete",
    description:
      "Understand harmony, rhythm, and composition from classical to modern",
    instructor: "Alex Turner",
    institution: "Melody Institute",
    category: "Music",
    rating: 4.6,
    students: 3200,
    duration: "26h",
    lessons: 88,
    level: "Beginner",
    price: 39.99,
    originalPrice: 149.99,
    color: "from-rose-500 to-rose-700",
    icon: "MT",
  },
  {
    id: 10,
    title: "Creative Writing Workshop",
    description:
      "Develop your writing voice through fiction, poetry, and storytelling",
    instructor: "Nina Brooks",
    institution: "Writers Guild",
    category: "Literature",
    rating: 4.8,
    students: 4800,
    duration: "18h",
    lessons: 60,
    level: "Beginner",
    price: 24.99,
    originalPrice: 99.99,
    color: "from-cyan-500 to-cyan-700",
    icon: "CW",
  },
  {
    id: 11,
    title: "Machine Learning with Python",
    description:
      "Deep learning, neural networks, and AI with TensorFlow and PyTorch",
    instructor: "Dr. Wei Zhang",
    institution: "AI Academy",
    category: "Programming",
    rating: 4.9,
    students: 11200,
    duration: "48h",
    lessons: 170,
    level: "Advanced",
    price: 79.99,
    originalPrice: 349.99,
    color: "from-violet-500 to-violet-700",
    icon: "ML",
  },
  {
    id: 12,
    title: "Graphic Design Essentials",
    description:
      "Adobe Photoshop, Illustrator, and brand identity design fundamentals",
    instructor: "Sofia Martinez",
    institution: "Design Studio",
    category: "Design",
    rating: 4.7,
    students: 5600,
    duration: "30h",
    lessons: 100,
    level: "Beginner",
    price: 44.99,
    originalPrice: 189.99,
    color: "from-fuchsia-500 to-fuchsia-700",
    icon: "GD",
  },
]

export const courseDetails: Record<number, CourseDetail> = {
  1: {
    ...allCourses[0],
    longDescription:
      "This comprehensive bootcamp takes you from zero to hero in web development. You will learn HTML, CSS, JavaScript, React, Node.js, and databases. By the end, you will be able to build full-stack applications and deploy them to the cloud.",
    whatYouLearn: [
      "Build responsive websites with HTML5 and CSS3",
      "Master JavaScript ES6+ and TypeScript",
      "Create dynamic UIs with React and Next.js",
      "Build REST APIs with Node.js and Express",
      "Work with databases: MongoDB and PostgreSQL",
      "Deploy applications to cloud platforms",
    ],
    modules: [
      {
        title: "Getting Started with HTML",
        lessons: [
          { id: 1, title: "Introduction to HTML", duration: "15 min", type: "video", completed: true },
          { id: 2, title: "HTML Elements & Structure", duration: "22 min", type: "video", completed: true },
          { id: 3, title: "Forms & Input Elements", duration: "18 min", type: "video", completed: true },
          { id: 4, title: "HTML Quiz", duration: "10 min", type: "quiz", completed: true },
        ],
      },
      {
        title: "CSS Fundamentals",
        lessons: [
          { id: 5, title: "CSS Selectors & Properties", duration: "20 min", type: "video", completed: true },
          { id: 6, title: "Flexbox Layout", duration: "25 min", type: "video", completed: true },
          { id: 7, title: "CSS Grid", duration: "22 min", type: "video", completed: false },
          { id: 8, title: "Responsive Design", duration: "28 min", type: "video", completed: false },
          { id: 9, title: "CSS Challenge", duration: "30 min", type: "exercise", completed: false },
        ],
      },
      {
        title: "JavaScript Essentials",
        lessons: [
          { id: 10, title: "Variables & Data Types", duration: "18 min", type: "video", completed: false },
          { id: 11, title: "Functions & Scope", duration: "24 min", type: "video", completed: false },
          { id: 12, title: "DOM Manipulation", duration: "30 min", type: "video", completed: false },
          { id: 13, title: "Async JavaScript", duration: "35 min", type: "video", completed: false },
          { id: 14, title: "JavaScript Quiz", duration: "15 min", type: "quiz", completed: false },
        ],
      },
      {
        title: "React Development",
        lessons: [
          { id: 15, title: "React Components", duration: "22 min", type: "video", completed: false },
          { id: 16, title: "State & Props", duration: "28 min", type: "video", completed: false },
          { id: 17, title: "Hooks Deep Dive", duration: "35 min", type: "video", completed: false },
          { id: 18, title: "Build a React App", duration: "45 min", type: "exercise", completed: false },
        ],
      },
    ],
  },
}

// Generate details for other courses dynamically
for (const course of allCourses) {
  if (!courseDetails[course.id]) {
    courseDetails[course.id] = {
      ...course,
      longDescription: `Master ${course.title} with this comprehensive course. ${course.description}. Join ${course.students.toLocaleString()} students and learn from ${course.instructor} at ${course.institution}.`,
      whatYouLearn: [
        `Understand core concepts of ${course.title}`,
        "Build practical projects from scratch",
        "Get certified upon completion",
        "Access lifetime course materials",
        "Join a community of learners",
        "Apply knowledge to real-world scenarios",
      ],
      modules: [
        {
          title: "Introduction",
          lessons: [
            { id: 1, title: "Course Overview", duration: "10 min", type: "video", completed: false },
            { id: 2, title: "Setting Up Your Environment", duration: "15 min", type: "video", completed: false },
            { id: 3, title: "First Steps", duration: "20 min", type: "video", completed: false },
          ],
        },
        {
          title: "Core Concepts",
          lessons: [
            { id: 4, title: "Fundamentals", duration: "25 min", type: "video", completed: false },
            { id: 5, title: "Intermediate Topics", duration: "30 min", type: "video", completed: false },
            { id: 6, title: "Practice Exercise", duration: "20 min", type: "exercise", completed: false },
            { id: 7, title: "Knowledge Check", duration: "10 min", type: "quiz", completed: false },
          ],
        },
        {
          title: "Advanced Topics",
          lessons: [
            { id: 8, title: "Deep Dive", duration: "35 min", type: "video", completed: false },
            { id: 9, title: "Case Studies", duration: "25 min", type: "reading", completed: false },
            { id: 10, title: "Final Project", duration: "60 min", type: "exercise", completed: false },
          ],
        },
      ],
    }
  }
}

export const categories = [
  "All",
  "Programming",
  "Design",
  "Mathematics",
  "Languages",
  "Science",
  "Music",
  "Literature",
  "Photography",
]

export const levels = ["All", "Beginner", "Intermediate", "Advanced"]
