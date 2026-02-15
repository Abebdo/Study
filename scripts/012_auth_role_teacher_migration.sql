-- Align auth role model with application roles: student | teacher | admin.
-- Safe to run multiple times.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND constraint_type = 'CHECK'
      AND constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'admin'));

UPDATE public.profiles
SET role = 'teacher'
WHERE role = 'instructor';

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
      WHEN NEW.raw_user_meta_data ->> 'role' = 'admin' THEN 'admin'
      WHEN NEW.raw_user_meta_data ->> 'role' IN ('teacher', 'instructor') THEN 'teacher'
      ELSE 'student'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE WHEN public.profiles.full_name = '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    role = CASE
      WHEN public.profiles.role = 'instructor' THEN 'teacher'
      ELSE public.profiles.role
    END;

  RETURN NEW;
END;
$$;
