-- ============================================================
-- PHASE 0 SECURITY VERIFICATION SCRIPT (manual execution)
-- Run this after applying scripts/004_phase0_supabase_schema_rls.sql
-- ============================================================

-- NOTE:
-- Replace placeholders before running:
-- <student_a_uuid>, <student_b_uuid>, <instructor_a_uuid>, <instructor_b_uuid>, <admin_uuid>
-- <course_uuid>, <section_of_instructor_b>, <order_id>

-- Anonymous check
RESET ALL;
SELECT 'A1 anonymous cannot list enrollments' AS test_name;
SELECT * FROM public.enrollments;

-- Student cross-user read denied
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SELECT set_config('request.jwt.claim.sub', '<student_a_uuid>', true);
SELECT 'B1 student cannot read other student progress' AS test_name;
SELECT * FROM public.progress WHERE user_id = '<student_b_uuid>';

-- Student cannot create course
SELECT 'C1 student cannot create course' AS test_name;
INSERT INTO public.courses (instructor_id, title) VALUES ('<student_a_uuid>', 'attack-course');

-- Student cannot self-enroll bypassing payment flow
SELECT 'C2 student cannot self-enroll' AS test_name;
INSERT INTO public.enrollments (user_id, course_id) VALUES ('<student_a_uuid>', '<course_uuid>');

-- Instructor cannot modify another instructor section
SELECT set_config('request.jwt.claim.sub', '<instructor_a_uuid>', true);
SELECT 'D1 instructor cannot modify foreign section' AS test_name;
UPDATE public.sections SET title='hack' WHERE id='<section_of_instructor_b>';

-- Instructor cannot view enrollments of other instructor course
SELECT 'E1 instructor cannot read other instructor enrollments' AS test_name;
SELECT *
FROM public.enrollments e
JOIN public.courses c ON c.id = e.course_id
WHERE c.instructor_id = '<instructor_b_uuid>';

-- Admin allowed operations
SELECT set_config('request.jwt.claim.sub', '<admin_uuid>', true);
SELECT 'F1 admin can read users' AS test_name;
SELECT count(*) FROM public.users;
SELECT 'F2 admin can update orders' AS test_name;
UPDATE public.orders SET status='paid' WHERE id='<order_id>';

-- Student privilege escalation denied
SELECT set_config('request.jwt.claim.sub', '<student_a_uuid>', true);
SELECT 'G1 student cannot escalate role' AS test_name;
UPDATE public.users
SET role_id = (SELECT id FROM public.roles WHERE name='admin')
WHERE id = '<student_a_uuid>';

-- Student forged paid order denied
SELECT 'H1 student cannot forge paid order values' AS test_name;
INSERT INTO public.orders (
  user_id,
  course_id,
  original_amount,
  discount_amount,
  final_amount,
  status
) VALUES (
  '<student_a_uuid>',
  '<course_uuid>',
  100,
  100,
  0,
  'paid'
);
