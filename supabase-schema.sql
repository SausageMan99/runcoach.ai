-- RunCoach MVP Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- Extends Supabase auth.users with additional fields
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: programs
-- Stores generated training programs
-- =====================================================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- User input data
  level TEXT NOT NULL CHECK (level IN ('débutant', 'intermédiaire', 'avancé')),
  goal TEXT NOT NULL,
  target_date DATE,
  sessions_per_week INTEGER NOT NULL CHECK (sessions_per_week BETWEEN 2 AND 7),
  reference_time TEXT,
  injuries_notes TEXT,
  
  -- Generated program (stored as JSONB)
  program_data JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_programs_user_id ON programs(user_id);
CREATE INDEX IF NOT EXISTS idx_programs_active ON programs(user_id, is_active) WHERE is_active = TRUE;

-- =====================================================
-- TABLE: session_tracking
-- Tracks completed training sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS session_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
  session_day TEXT NOT NULL,
  
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  
  UNIQUE(program_id, week_number, session_day)
);

-- Indexes for tracking queries
CREATE INDEX IF NOT EXISTS idx_tracking_program ON session_tracking(program_id);
CREATE INDEX IF NOT EXISTS idx_tracking_user ON session_tracking(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- Users can only access their own data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tracking ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Programs policies
CREATE POLICY "Users can view own programs"
  ON programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own programs"
  ON programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs"
  ON programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs"
  ON programs FOR DELETE
  USING (auth.uid() = user_id);

-- Session tracking policies
CREATE POLICY "Users can view own tracking"
  ON session_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracking"
  ON session_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracking"
  ON session_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracking"
  ON session_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Done! Your database is ready.
-- =====================================================
