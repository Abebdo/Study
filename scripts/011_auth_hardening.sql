-- Auth hardening migration.
-- 1) Ensure profiles are auto-created for every auth.users record.
-- 2) Harden profile and enrollment RLS access checks.

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    CASE
      WHEN NEW.raw_user_meta_data ->> 'role' IN ('admin', 'instructor') THEN NEW.raw_user_meta_data ->> 'role'
      ELSE 'student'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_read_access ON public.profiles;
CREATE POLICY profiles_read_access ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
  OR public.current_user_role() = 'admin'
);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
FOR UPDATE
USING (auth.uid() = id OR public.current_user_role() = 'admin')
WITH CHECK (auth.uid() = id OR public.current_user_role() = 'admin');

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS enrollments_select_own ON public.enrollments;
CREATE POLICY enrollments_select_own ON public.enrollments
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.current_user_role() = 'admin'
  OR EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = enrollments.course_id
      AND c.instructor_id = auth.uid()
  )
);
