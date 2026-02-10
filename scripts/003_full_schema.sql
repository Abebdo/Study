-- ============================================
-- LMS Platform - Full Schema Setup
-- Drop existing and recreate cleanly
-- ============================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS public.live_attendance CASCADE;
DROP TABLE IF EXISTS public.live_sessions CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.quizzes CASCADE;
DROP TABLE IF EXISTS public.lesson_progress CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==========================================
-- 1. PROFILES
-- ==========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  language TEXT DEFAULT 'en',
  streak INTEGER DEFAULT 0,
  total_hours_learned NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 2. CATEGORIES
-- ==========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT '',
  color TEXT DEFAULT 'from-blue-500 to-blue-700',
  course_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);

-- ==========================================
-- 3. COURSES
-- ==========================================
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  category_id UUID REFERENCES public.categories(id),
  price NUMERIC(10,2) DEFAULT 0,
  original_price NUMERIC(10,2) DEFAULT 0,
  cover_image TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  color TEXT DEFAULT 'from-blue-500 to-blue-700',
  level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  language TEXT DEFAULT 'English',
  duration TEXT DEFAULT '',
  rating NUMERIC(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_select_published" ON public.courses FOR SELECT USING (
  is_published = true OR instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "courses_insert_instructor" ON public.courses FOR INSERT WITH CHECK (
  instructor_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);
CREATE POLICY "courses_update_own" ON public.courses FOR UPDATE USING (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "courses_delete_own" ON public.courses FOR DELETE USING (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 4. SECTIONS
-- ==========================================
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sections_select" ON public.sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (is_published = true OR instructor_id = auth.uid()))
);
CREATE POLICY "sections_insert_instructor" ON public.sections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);
CREATE POLICY "sections_update_instructor" ON public.sections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);
CREATE POLICY "sections_delete_instructor" ON public.sections FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);

-- ==========================================
-- 5. LESSONS
-- ==========================================
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'video' CHECK (type IN ('video', 'quiz', 'exercise', 'text')),
  video_url TEXT DEFAULT '',
  video_duration INTEGER DEFAULT 0,
  content TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_select" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "lessons_insert_instructor" ON public.lessons FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sections s
    JOIN public.courses c ON c.id = s.course_id
    WHERE s.id = section_id AND c.instructor_id = auth.uid()
  )
);
CREATE POLICY "lessons_update_instructor" ON public.lessons FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.sections s
    JOIN public.courses c ON c.id = s.course_id
    WHERE s.id = section_id AND c.instructor_id = auth.uid()
  )
);
CREATE POLICY "lessons_delete_instructor" ON public.lessons FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.sections s
    JOIN public.courses c ON c.id = s.course_id
    WHERE s.id = section_id AND c.instructor_id = auth.uid()
  )
);

-- ==========================================
-- 6. ENROLLMENTS
-- ==========================================
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  last_lesson_id UUID REFERENCES public.lessons(id),
  last_video_position INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "enrollments_insert_own" ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "enrollments_update_own" ON public.enrollments FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- 7. LESSON PROGRESS
-- ==========================================
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  video_position INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- 8. QUIZZES
-- ==========================================
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  time_limit INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes_select" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "quizzes_insert_instructor" ON public.quizzes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);
CREATE POLICY "quizzes_update_instructor" ON public.quizzes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);
CREATE POLICY "quizzes_delete_instructor" ON public.quizzes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);

-- ==========================================
-- 9. QUESTIONS
-- ==========================================
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'text', 'image')),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_select" ON public.questions FOR SELECT USING (true);
CREATE POLICY "questions_manage_instructor" ON public.questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
  )
);

-- ==========================================
-- 10. ANSWERS
-- ==========================================
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers_select" ON public.answers FOR SELECT USING (true);
CREATE POLICY "answers_manage_instructor" ON public.answers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.questions qu
    JOIN public.quizzes qz ON qz.id = qu.quiz_id
    JOIN public.courses c ON c.id = qz.course_id
    WHERE qu.id = question_id AND c.instructor_id = auth.uid()
  )
);

-- ==========================================
-- 11. QUIZ ATTEMPTS
-- ==========================================
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  answers JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quiz_attempts_select_own" ON public.quiz_attempts FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
  )
);
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "quiz_attempts_update_own" ON public.quiz_attempts FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- 12. MESSAGES
-- ==========================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "messages_update_receiver" ON public.messages FOR UPDATE USING (receiver_id = auth.uid());

-- ==========================================
-- 13. NOTIFICATIONS
-- ==========================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('course', 'live', 'discount', 'achievement', 'message', 'update', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('instructor', 'admin'))
);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- 14. ORDERS
-- ==========================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  original_amount NUMERIC(10,2),
  coupon_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  payment_method TEXT DEFAULT '',
  payment_reference TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 15. COUPONS
-- ==========================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_select_active" ON public.coupons FOR SELECT USING (
  is_active = true OR instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "coupons_insert_instructor" ON public.coupons FOR INSERT WITH CHECK (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "coupons_update_instructor" ON public.coupons FOR UPDATE USING (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "coupons_delete_instructor" ON public.coupons FOR DELETE USING (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 16. FAVORITES
-- ==========================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- 17. LIVE SESSIONS
-- ==========================================
CREATE TABLE public.live_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  attendee_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_sessions_select" ON public.live_sessions FOR SELECT USING (true);
CREATE POLICY "live_sessions_insert_instructor" ON public.live_sessions FOR INSERT WITH CHECK (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "live_sessions_update_instructor" ON public.live_sessions FOR UPDATE USING (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "live_sessions_delete_instructor" ON public.live_sessions FOR DELETE USING (
  instructor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ==========================================
-- 18. LIVE ATTENDANCE
-- ==========================================
CREATE TABLE public.live_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.live_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "live_attendance_select" ON public.live_attendance FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.live_sessions WHERE id = session_id AND instructor_id = auth.uid())
);
CREATE POLICY "live_attendance_insert_own" ON public.live_attendance FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "live_attendance_update_own" ON public.live_attendance FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- 19. REVIEWS
-- ==========================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (user_id = auth.uid());

-- ==========================================
-- 20. NOTIFICATION PREFERENCES
-- ==========================================
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_updates BOOLEAN DEFAULT true,
  assignment_reminders BOOLEAN DEFAULT true,
  messages_notif BOOLEAN DEFAULT true,
  promotional BOOLEAN DEFAULT false,
  weekly_report BOOLEAN DEFAULT true,
  achievements BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif_prefs_select_own" ON public.notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_prefs_insert_own" ON public.notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "notif_prefs_update_own" ON public.notification_preferences FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- INDEXES for Performance
-- ==========================================
CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_published ON public.courses(is_published);
CREATE INDEX idx_sections_course ON public.sections(course_id);
CREATE INDEX idx_sections_sort ON public.sections(course_id, sort_order);
CREATE INDEX idx_lessons_section ON public.lessons(section_id);
CREATE INDEX idx_lessons_sort ON public.lessons(section_id, sort_order);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX idx_quizzes_lesson ON public.quizzes(lesson_id);
CREATE INDEX idx_questions_quiz ON public.questions(quiz_id);
CREATE INDEX idx_answers_question ON public.answers(question_id);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_course ON public.orders(course_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_live_sessions_instructor ON public.live_sessions(instructor_id);
CREATE INDEX idx_live_sessions_status ON public.live_sessions(status);
CREATE INDEX idx_reviews_course ON public.reviews(course_id);

-- ==========================================
-- TRIGGER: Auto-create profile on signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Auto-create notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- FUNCTION: Update course progress
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_enrollment_progress(
  p_user_id UUID,
  p_course_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  new_progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons
  FROM public.lessons l
  JOIN public.sections s ON s.id = l.section_id
  WHERE s.course_id = p_course_id;

  SELECT COUNT(*) INTO completed_lessons
  FROM public.lesson_progress lp
  JOIN public.lessons l ON l.id = lp.lesson_id
  JOIN public.sections s ON s.id = l.section_id
  WHERE lp.user_id = p_user_id AND s.course_id = p_course_id AND lp.completed = true;

  IF total_lessons > 0 THEN
    new_progress := (completed_lessons * 100) / total_lessons;
  ELSE
    new_progress := 0;
  END IF;

  UPDATE public.enrollments
  SET progress = new_progress,
      completed_at = CASE WHEN new_progress >= 100 THEN NOW() ELSE NULL END
  WHERE user_id = p_user_id AND course_id = p_course_id;

  RETURN new_progress;
END;
$$;

-- ==========================================
-- FUNCTION: Update course rating
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.courses
  SET rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE course_id = NEW.course_id),
      total_ratings = (SELECT COUNT(*) FROM public.reviews WHERE course_id = NEW.course_id)
  WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_rating();
