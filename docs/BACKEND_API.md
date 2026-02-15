# Backend API (implemented)

## Authentication
All endpoints rely on Supabase server session cookies and enforce server-side auth/role checks.

## Endpoints

### `GET /api/me`
Returns authenticated user id + role.

### `GET /api/courses`
Returns courses visible under RLS.

### `POST /api/courses`
Creates a course (instructor/admin only).

Body:
```json
{
  "title": "Course title",
  "description": "...",
  "price": 0,
  "isPublished": false
}
```

### `GET /api/instructor/courses`
Returns own courses for instructors, all courses for admins.

### `GET /api/instructor/analytics/students`
Returns instructor-level student analytics snapshot:
- `enrolledStudents`
- `activeEnrollments`
- `avgProgress`

### `POST /api/enrollments/free`
Enroll current student/admin in free published course.

Body:
```json
{ "courseId": "<uuid>" }
```

Uses RPC function `public.enroll_in_free_course`.

### `GET /api/progress?courseId=<uuid>`
Gets current user progress (optionally scoped by course).

### `POST /api/progress`
Upserts lesson progress for current user.

Body:
```json
{
  "courseId": "<uuid>",
  "lessonId": "<uuid>",
  "videoId": "<uuid or null>",
  "watchedSeconds": 120,
  "completed": false
}
```

Uses RPC function `public.upsert_lesson_progress`.

### `POST /api/lessons/access-check`
Checks sequential lesson access.

Body:
```json
{
  "courseId": "<uuid>",
  "lessonId": "<uuid>"
}
```

Uses RPC function `public.can_access_lesson`.

### `POST /api/quizzes/attempts`
Submits quiz attempt for current user (student/admin).

Body:
```json
{
  "quizId": "<uuid>",
  "submittedAnswers": {
    "<question_uuid>": { "value": "answer" }
  }
}
```

Uses RPC function `public.submit_quiz_attempt`.

## SQL migration order
1. `scripts/004_phase0_supabase_schema_rls.sql`
2. `scripts/007_phase1_core_rpc.sql`
3. `scripts/008_phase2_learning_and_quiz_rpc.sql`
