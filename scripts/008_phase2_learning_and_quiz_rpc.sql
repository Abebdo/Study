-- ============================================================
-- PHASE 2/4 RPC: sequential access + progress aggregation + quiz grading
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.can_access_lesson(
  p_course_id UUID,
  p_lesson_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_enrolled BOOLEAN;
  v_prev_incomplete_count INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.user_id = v_user
      AND e.course_id = p_course_id
      AND e.status IN ('active', 'completed')
  ) INTO v_enrolled;

  IF NOT v_enrolled THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO v_prev_incomplete_count
  FROM (
    SELECT l.id,
      ROW_NUMBER() OVER (ORDER BY s.sort_order, l.sort_order) AS seq
    FROM public.lessons l
    JOIN public.sections s ON s.id = l.section_id
    WHERE s.course_id = p_course_id
  ) ordered
  WHERE ordered.seq < (
      SELECT cur.seq
      FROM (
        SELECT l2.id,
          ROW_NUMBER() OVER (ORDER BY s2.sort_order, l2.sort_order) AS seq
        FROM public.lessons l2
        JOIN public.sections s2 ON s2.id = l2.section_id
        WHERE s2.course_id = p_course_id
      ) cur
      WHERE cur.id = p_lesson_id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.progress p
      WHERE p.user_id = v_user
        AND p.lesson_id = ordered.id
        AND p.completed = TRUE
    );

  RETURN COALESCE(v_prev_incomplete_count, 0) = 0;
END;
$$;

REVOKE ALL ON FUNCTION public.can_access_lesson(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_lesson(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.course_progress_percent(p_course_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH lesson_count AS (
    SELECT COUNT(*)::NUMERIC AS total_lessons
    FROM public.lessons l
    JOIN public.sections s ON s.id = l.section_id
    WHERE s.course_id = p_course_id
  ),
  completed_count AS (
    SELECT COUNT(*)::NUMERIC AS completed_lessons
    FROM public.progress p
    WHERE p.user_id = auth.uid()
      AND p.course_id = p_course_id
      AND p.completed = TRUE
  )
  SELECT
    CASE
      WHEN lc.total_lessons = 0 THEN 0
      ELSE ROUND((cc.completed_lessons / lc.total_lessons) * 100, 2)
    END
  FROM lesson_count lc
  CROSS JOIN completed_count cc
$$;

REVOKE ALL ON FUNCTION public.course_progress_percent(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.course_progress_percent(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id UUID,
  p_submitted_answers JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_course_id UUID;
  v_lesson_id UUID;
  v_attempt_number INTEGER;
  v_total_points NUMERIC := 0;
  v_earned_points NUMERIC := 0;
  v_score NUMERIC := 0;
  v_passing_score NUMERIC := 70;
  v_attempt_id UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  SELECT c.id, l.id, q.passing_score
  INTO v_course_id, v_lesson_id, v_passing_score
  FROM public.quizzes q
  JOIN public.lessons l ON l.id = q.lesson_id
  JOIN public.sections s ON s.id = l.section_id
  JOIN public.courses c ON c.id = s.course_id
  WHERE q.id = p_quiz_id;

  IF v_course_id IS NULL THEN
    RAISE EXCEPTION 'QUIZ_NOT_FOUND';
  END IF;

  IF NOT public.can_access_lesson(v_course_id, v_lesson_id) THEN
    RAISE EXCEPTION 'LESSON_LOCKED';
  END IF;

  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO v_attempt_number
  FROM public.quiz_attempts
  WHERE quiz_id = p_quiz_id
    AND user_id = v_user;

  SELECT COALESCE(SUM(points), 0)
  INTO v_total_points
  FROM public.questions
  WHERE quiz_id = p_quiz_id;

  SELECT COALESCE(SUM(q.points), 0)
  INTO v_earned_points
  FROM public.questions q
  WHERE q.quiz_id = p_quiz_id
    AND p_submitted_answers ? q.id::text
    AND p_submitted_answers -> q.id::text = q.correct_answer;

  IF v_total_points > 0 THEN
    v_score := ROUND((v_earned_points / v_total_points) * 100, 2);
  END IF;

  INSERT INTO public.quiz_attempts (
    quiz_id,
    user_id,
    attempt_number,
    submitted_answers,
    score,
    passed,
    submitted_at
  ) VALUES (
    p_quiz_id,
    v_user,
    v_attempt_number,
    COALESCE(p_submitted_answers, '{}'::jsonb),
    v_score,
    v_score >= v_passing_score,
    NOW()
  )
  RETURNING id INTO v_attempt_id;

  RETURN v_attempt_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_quiz_attempt(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(UUID, JSONB) TO authenticated;

COMMIT;
