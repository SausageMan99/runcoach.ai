-- Fix RLS policies: wrap auth.uid() in (select ...) to avoid per-row re-evaluation
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- =====================================================
-- PROFILES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING ((select auth.uid()) = id);

-- =====================================================
-- PROGRAMS
-- =====================================================
DROP POLICY IF EXISTS "Users can view own programs" ON programs;
CREATE POLICY "Users can view own programs"
  ON programs FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own programs" ON programs;
CREATE POLICY "Users can insert own programs"
  ON programs FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own programs" ON programs;
CREATE POLICY "Users can update own programs"
  ON programs FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own programs" ON programs;
CREATE POLICY "Users can delete own programs"
  ON programs FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- SESSION_TRACKING
-- =====================================================
DROP POLICY IF EXISTS "Users can view own tracking" ON session_tracking;
CREATE POLICY "Users can view own tracking"
  ON session_tracking FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own tracking" ON session_tracking;
CREATE POLICY "Users can insert own tracking"
  ON session_tracking FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own tracking" ON session_tracking;
CREATE POLICY "Users can update own tracking"
  ON session_tracking FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own tracking" ON session_tracking;
CREATE POLICY "Users can delete own tracking"
  ON session_tracking FOR DELETE
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- DAILY_CHECK_INS
-- =====================================================
DROP POLICY IF EXISTS "Users can read own check-ins" ON daily_check_ins;
CREATE POLICY "Users can read own check-ins"
  ON daily_check_ins FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own check-ins" ON daily_check_ins;
CREATE POLICY "Users can insert own check-ins"
  ON daily_check_ins FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own check-ins" ON daily_check_ins;
CREATE POLICY "Users can update own check-ins"
  ON daily_check_ins FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- Fix missing index on programs.race_id (foreign key)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_programs_race_id ON programs(race_id);

-- =====================================================
-- Fix function search_path security warnings
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name');
  RETURN new;
END;
$$;

-- Fix races_search_vector_update if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'races_search_vector_update') THEN
    EXECUTE 'ALTER FUNCTION public.races_search_vector_update() SET search_path = public';
  END IF;
END;
$$;
