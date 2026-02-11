-- Daily Check-Ins table for adaptive program feature
CREATE TABLE IF NOT EXISTS daily_check_ins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL, -- composite "week-day" e.g. "3-Lundi"
    feeling INTEGER NOT NULL CHECK (feeling BETWEEN 1 AND 3), -- 1=good, 2=tired, 3=very tired
    adjustment_made JSONB DEFAULT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_daily_check_ins_user_date ON daily_check_ins(user_id, date DESC);
CREATE INDEX idx_daily_check_ins_program ON daily_check_ins(program_id);

-- RLS
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own check-ins"
    ON daily_check_ins FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
    ON daily_check_ins FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
    ON daily_check_ins FOR UPDATE
    USING (auth.uid() = user_id);
