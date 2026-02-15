export type AppRole = "student" | "teacher" | "admin"

export function normalizeRole(role: unknown): AppRole {
  if (role === "admin") return "admin"
  if (role === "teacher" || role === "instructor") return "teacher"
  return "student"
}
