// User profile types
export interface UserProfile {
    id: string
    first_name: string | null
    created_at: string
    updated_at: string
}

// Program types
export interface Program {
    id: string
    user_id: string
    level: 'débutant' | 'intermédiaire' | 'avancé'
    goal: string
    target_date: string | null
    sessions_per_week: number
    reference_time: string | null
    injuries_notes: string | null
    program_data: ProgramData
    created_at: string
    is_active: boolean
    race_id: string | null
}

// Race types
export interface Race {
    id: string
    name: string
    city: string
    country: string
    date: string
    distance_km: number
    elevation_gain_m: number
    elevation_loss_m: number
    terrain_type: 'route' | 'trail' | 'mixte'
    difficulty: 'facile' | 'moyen' | 'difficile' | 'expert'
    key_points: string[]
    typical_weather: string | null
    website_url: string | null
}

// Daily Check-In types
export interface DailyCheckIn {
    id: string
    user_id: string
    program_id: string
    session_id: string
    feeling: 1 | 2 | 3
    adjustment_made: AdjustedSession | null
    date: string
    created_at: string
}

export interface AdjustedSession {
    original_type: string
    adjusted_type: string
    intensity_reduction: number
    message: string
}

export interface CheckInResult {
    success: boolean
    adjustment: AdjustedSession | null
    message: string
}

export interface ProgramData {
    user_profile: {
        level: string
        goal: string
        target_date: string | null
        weeks_available: number
        sessions_per_week: number
        vma_estimated: number | null
        injuries_notes: string | null
    }
    program_summary: {
        total_weeks: number
        total_sessions: number
        peak_week_volume_km: number
        philosophy: string
    }
    weeks: Week[]
    tips: string[]
}

export interface Week {
    week_number: number
    focus: string
    total_volume_km: number
    notes: string
    sessions: Session[]
}

export interface Session {
    day: string
    rest_day: boolean
    session_type?: string
    duration_min?: number
    distance_km?: number
    pace_target?: string
    description: string
    rpe?: number
    workout_structure?: string
    intervals?: {
        repetitions: number
        distance_m: number
        pace_target: string
        recovery: string
    }
}

// Session tracking types
export interface SessionTracking {
    id: string
    program_id: string
    user_id: string
    week_number: number
    session_day: string
    completed: boolean
    completed_at: string | null
    notes: string | null
}

// Stats types
export interface UserStats {
    completedSessions: number
    totalSessions: number
    currentStreak: number
    nextSession: {
        weekNumber: number
        day: string
        sessionType: string
    } | null
}
