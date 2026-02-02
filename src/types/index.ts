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
