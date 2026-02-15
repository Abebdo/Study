-- ============================================================
-- PHASE 1/2 CORE RPC: auth-backed enrollment + progress tracking
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT r.name
  FROM public.users u
  JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.enroll_in_free_course(p_course_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_course public.courses%ROWTYPE;
  v_existing UUID;
  v_order_id UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT * INTO v_course FROM public.courses WHERE id = p_course_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'COURSE_NOT_FOUND';
  END IF;

  IF v_course.is_published IS NOT TRUE THEN
    RAISE EXCEPTION 'COURSE_NOT_PUBLISHED';
  END IF;

  IF v_course.price <> 0 THEN
    RAISE EXCEPTION 'COURSE_NOT_FREE';
  END IF;

  SELECT e.id INTO v_existing
  FROM public.enrollments e
  WHERE e.user_id = v_user AND e.course_id = p_course_id;

  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  INSERT INTO public.orders (
    user_id,
    course_id,
    original_amount,
    discount_amount,
    final_amount,
    status
  ) VALUES (
    v_user,
    p_course_id,
    0,
    0,
    0,
    'paid'
  ) RETURNING id INTO v_order_id;

  INSERT INTO public.enrollments (user_id, course_id, status)
  VALUES (v_user, p_course_id, 'active')
  RETURNING id INTO v_existing;

  RETURN v_existing;
END;
$$;

REVOKE ALL ON FUNCTION public.enroll_in_free_course(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enroll_in_free_course(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.upsert_lesson_progress(
  p_course_id UUID,
  p_lesson_id UUID,
  p_video_id UUID,
  p_watched_seconds INTEGER,
  p_completed BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_progress_id UUID;
  v_is_enrolled BOOLEAN;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  IF p_watched_seconds < 0 THEN
    RAISE EXCEPTION 'INVALID_WATCHED_SECONDS';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.user_id = v_user
      AND e.course_id = p_course_id
      AND e.status IN ('active', 'completed')
  ) INTO v_is_enrolled;

  IF NOT v_is_enrolled THEN
    RAISE EXCEPTION 'NOT_ENROLLED';
  END IF;

  INSERT INTO public.progress (user_id, course_id, lesson_id, video_id, watched_seconds, completed)
  VALUES (v_user, p_course_id, p_lesson_id, p_video_id, p_watched_seconds, p_completed)
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    watched_seconds = GREATEST(public.progress.watched_seconds, EXCLUDED.watched_seconds),
    completed = public.progress.completed OR EXCLUDED.completed,
    video_id = COALESCE(EXCLUDED.video_id, public.progress.video_id),
    updated_at = NOW()
  RETURNING id INTO v_progress_id;

  RETURN v_progress_id;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_lesson_progress(UUID, UUID, UUID, INTEGER, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_lesson_progress(UUID, UUID, UUID, INTEGER, BOOLEAN) TO authenticated;

COMMIT;
