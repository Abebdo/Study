-- ============================================================
-- PHASE 0 (ONLY): LMS Supabase Full Schema + Strict RLS Audit
-- Scope: schema + RLS only (no triggers, no business logic workflows)
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 0) Cleanup (idempotent)
-- ============================================================
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- ============================================================
-- 1) Identity model
-- ============================================================
CREATE TABLE public.roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (name IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.roles(name)
VALUES ('student'), ('instructor'), ('admin');

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES public.roles(id),
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2) Course content model
-- ============================================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, sort_order)
);

CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(section_id, sort_order)
);

CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3) Enrollment and learning state
-- ============================================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'refunded')),
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
  watched_seconds INTEGER NOT NULL DEFAULT 0 CHECK (watched_seconds >= 0),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- 4) Quizzes
-- ============================================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time_limit_seconds INTEGER CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0),
  max_attempts INTEGER CHECK (max_attempts IS NULL OR max_attempts > 0),
  passing_score NUMERIC(5,2) NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multi_choice', 'true_false', 'short_answer')),
  prompt TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB,
  points NUMERIC(6,2) NOT NULL DEFAULT 1 CHECK (points > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(quiz_id, sort_order)
);

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  submitted_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  score NUMERIC(5,2) CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  passed BOOLEAN,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  UNIQUE(quiz_id, user_id, attempt_number)
);

-- ============================================================
-- 5) Communication
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id <> recipient_id)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6) Commerce
-- ============================================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  original_amount NUMERIC(10,2) NOT NULL CHECK (original_amount >= 0),
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  final_amount NUMERIC(10,2) NOT NULL CHECK (final_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_reference TEXT NOT NULL UNIQUE,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7) Enable RLS on ALL tables
-- ============================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8) RLS POLICIES
-- NOTE: Role checks rely on JWT app_metadata.lms_role:
--       auth.jwt() -> 'app_metadata' ->> 'lms_role'
-- ============================================================

-- roles
CREATE POLICY roles_read_authenticated ON public.roles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- users
CREATE POLICY users_self_read ON public.users
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY users_admin_read_all ON public.users
  FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

CREATE POLICY users_self_insert_with_claim_role ON public.users
  FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.id = role_id
        AND r.name = COALESCE(auth.jwt() -> 'app_metadata' ->> 'lms_role', 'student')
    )
  );

CREATE POLICY users_self_update_without_role_escalation ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role_id = (SELECT u.role_id FROM public.users u WHERE u.id = auth.uid())
  );

CREATE POLICY users_admin_update_delete ON public.users
  FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

CREATE POLICY users_admin_delete ON public.users
  FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

-- courses
CREATE POLICY courses_read ON public.courses
  FOR SELECT
  USING (
    is_published = TRUE
    OR instructor_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = id
        AND e.user_id = auth.uid()
        AND e.status IN ('active', 'completed')
    )
  );

CREATE POLICY courses_instructor_insert ON public.courses
  FOR INSERT
  WITH CHECK (
    instructor_id = auth.uid()
    AND (auth.jwt() -> 'app_metadata' ->> 'lms_role') IN ('instructor', 'admin')
  );

CREATE POLICY courses_instructor_update ON public.courses
  FOR UPDATE
  USING (
    instructor_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
  )
  WITH CHECK (
    instructor_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
  );

CREATE POLICY courses_instructor_delete ON public.courses
  FOR DELETE
  USING (
    instructor_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
  );

-- sections
CREATE POLICY sections_read ON public.sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = course_id
        AND (
          c.is_published = TRUE
          OR c.instructor_id = auth.uid()
          OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = c.id
              AND e.user_id = auth.uid()
              AND e.status IN ('active', 'completed')
          )
        )
    )
  );

CREATE POLICY sections_instructor_insert ON public.sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY sections_instructor_update ON public.sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY sections_instructor_delete ON public.sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

-- lessons
CREATE POLICY lessons_read ON public.lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.sections s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = section_id
        AND (
          c.instructor_id = auth.uid()
          OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = c.id
              AND e.user_id = auth.uid()
              AND e.status IN ('active', 'completed')
          )
          OR (c.is_published = TRUE AND is_preview = TRUE)
        )
    )
  );

CREATE POLICY lessons_instructor_insert ON public.lessons
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.sections s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = section_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY lessons_instructor_update ON public.lessons
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.sections s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = section_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.sections s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = section_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY lessons_instructor_delete ON public.lessons
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.sections s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = section_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

-- videos
CREATE POLICY videos_read ON public.videos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (
          c.instructor_id = auth.uid()
          OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = c.id
              AND e.user_id = auth.uid()
              AND e.status IN ('active', 'completed')
          )
        )
    )
  );

CREATE POLICY videos_instructor_insert ON public.videos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY videos_instructor_update ON public.videos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY videos_instructor_delete ON public.videos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

-- enrollments
CREATE POLICY enrollments_read ON public.enrollments
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY enrollments_student_insert ON public.enrollments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY enrollments_self_or_admin_update ON public.enrollments
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
  );

CREATE POLICY enrollments_self_or_admin_delete ON public.enrollments
  FOR DELETE
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
  );

-- progress
CREATE POLICY progress_read ON public.progress
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY progress_student_insert ON public.progress
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_id
        AND e.user_id = auth.uid()
        AND e.status IN ('active', 'completed')
    )
  );

CREATE POLICY progress_student_update ON public.progress
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = course_id
        AND e.user_id = auth.uid()
        AND e.status IN ('active', 'completed')
    )
  );

CREATE POLICY progress_student_delete ON public.progress
  FOR DELETE
  USING (user_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

-- quizzes
CREATE POLICY quizzes_read ON public.quizzes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (
          c.instructor_id = auth.uid()
          OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = c.id
              AND e.user_id = auth.uid()
              AND e.status IN ('active', 'completed')
          )
        )
    )
  );

CREATE POLICY quizzes_instructor_insert ON public.quizzes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY quizzes_instructor_update ON public.quizzes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY quizzes_instructor_delete ON public.quizzes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE l.id = lesson_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

-- questions
CREATE POLICY questions_read ON public.questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE q.id = quiz_id
        AND (
          c.instructor_id = auth.uid()
          OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.course_id = c.id
              AND e.user_id = auth.uid()
              AND e.status IN ('active', 'completed')
          )
        )
    )
  );

CREATE POLICY questions_instructor_insert ON public.questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE q.id = quiz_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY questions_instructor_update ON public.questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE q.id = quiz_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE q.id = quiz_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

CREATE POLICY questions_instructor_delete ON public.questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE q.id = quiz_id
        AND (c.instructor_id = auth.uid() OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
    )
  );

-- quiz_attempts
CREATE POLICY quiz_attempts_read ON public.quiz_attempts
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY quiz_attempts_student_insert ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.quizzes q
      JOIN public.lessons l ON l.id = q.lesson_id
      JOIN public.sections s ON s.id = l.section_id
      JOIN public.courses c ON c.id = s.course_id
      JOIN public.enrollments e ON e.course_id = c.id
      WHERE q.id = quiz_id
        AND e.user_id = auth.uid()
        AND e.status IN ('active', 'completed')
    )
  );

CREATE POLICY quiz_attempts_student_update ON public.quiz_attempts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- messages
CREATE POLICY messages_read_participants ON public.messages
  FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY messages_insert_sender_only ON public.messages
  FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- notifications
CREATE POLICY notifications_read_own ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_insert_instructor_admin ON public.notifications
  FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'lms_role') IN ('instructor', 'admin'));

CREATE POLICY notifications_delete_admin ON public.notifications
  FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

-- orders
CREATE POLICY orders_read ON public.orders
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY orders_student_insert ON public.orders
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY orders_admin_update_delete ON public.orders
  FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

CREATE POLICY orders_admin_delete ON public.orders
  FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

-- payments
CREATE POLICY payments_read_related ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = order_id
        AND (
          o.user_id = auth.uid()
          OR (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = o.course_id AND c.instructor_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY payments_admin_insert_update ON public.payments
  FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

CREATE POLICY payments_admin_update ON public.payments
  FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

CREATE POLICY payments_admin_delete ON public.payments
  FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin');

-- coupons
CREATE POLICY coupons_read_active ON public.coupons
  FOR SELECT
  USING (active = TRUE);

CREATE POLICY coupons_instructor_admin_insert ON public.coupons
  FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'lms_role') IN ('instructor', 'admin')
    AND created_by = auth.uid()
  );

CREATE POLICY coupons_instructor_admin_update ON public.coupons
  FOR UPDATE
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR (
      (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'instructor'
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR (
      (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'instructor'
      AND created_by = auth.uid()
    )
  );

CREATE POLICY coupons_instructor_admin_delete ON public.coupons
  FOR DELETE
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'admin'
    OR (
      (auth.jwt() -> 'app_metadata' ->> 'lms_role') = 'instructor'
      AND created_by = auth.uid()
    )
  );

COMMIT;

-- ============================================================
-- 9) SECURITY TEST CASES (run manually in SQL editor)
-- ============================================================
-- Assume JWT carries app_metadata.lms_role in claims.
-- Pattern:
--   SELECT set_config('request.jwt.claim.sub', '<uuid>', true);
--   SELECT set_config('request.jwt.claim.role', 'authenticated', true);
--   SELECT set_config('request.jwt.claim.app_metadata', '{"lms_role":"student"}', true);

-- Case A: anonymous cannot read enrollments
-- RESET ALL;
-- SELECT * FROM public.enrollments; -- expect no access / no rows by RLS

-- Case B: student cannot read another student's progress
-- SELECT set_config('request.jwt.claim.sub', '<student_a>', true);
-- SELECT set_config('request.jwt.claim.app_metadata', '{"lms_role":"student"}', true);
-- SELECT * FROM public.progress WHERE user_id = '<student_b>'; -- expect 0 rows

-- Case C: student cannot create course
-- INSERT INTO public.courses (instructor_id, title) VALUES ('<student_a>', 'x'); -- expect denied

-- Case D: instructor cannot edit another instructor course section
-- SELECT set_config('request.jwt.claim.sub', '<instructor_a>', true);
-- SELECT set_config('request.jwt.claim.app_metadata', '{"lms_role":"instructor"}', true);
-- UPDATE public.sections SET title='hack' WHERE id='<section_of_instructor_b>'; -- expect denied

-- Case E: student cannot self-escalate role_id in users
-- SELECT set_config('request.jwt.claim.sub', '<student_a>', true);
-- SELECT set_config('request.jwt.claim.app_metadata', '{"lms_role":"student"}', true);
-- UPDATE public.users SET role_id=(SELECT id FROM public.roles WHERE name='admin') WHERE id='<student_a>'; -- expect denied

-- Case F: admin can read users and update orders/payments
-- SELECT set_config('request.jwt.claim.sub', '<admin_uuid>', true);
-- SELECT set_config('request.jwt.claim.app_metadata', '{"lms_role":"admin"}', true);
-- SELECT count(*) FROM public.users; -- expect allowed
-- UPDATE public.orders SET status='paid' WHERE id='<order_uuid>'; -- expect allowed
