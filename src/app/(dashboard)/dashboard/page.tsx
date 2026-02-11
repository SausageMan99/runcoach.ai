import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'
import type { Program, SessionTracking, Race, DailyCheckIn } from '@/types'

interface DashboardPageProps {
    searchParams: Promise<{ new?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const supabase = await createClient()
    const params = await searchParams

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single()

    // Get active program
    const { data: program } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

    // Get tracking data if program exists
    let tracking: SessionTracking[] = []
    let race: Race | null = null
    let hasCheckedInToday = false
    let recentFeelings: number[] = []

    if (program) {
        const { data: trackingData } = await supabase
            .from('session_tracking')
            .select('*')
            .eq('program_id', program.id)

        tracking = trackingData || []

        // Check today's check-in
        const today = new Date().toISOString().split('T')[0]
        const { data: todayCheckIn } = await supabase
            .from('daily_check_ins')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

        hasCheckedInToday = !!todayCheckIn

        // Get recent check-in feelings for injury risk
        const { data: recentCheckIns } = await supabase
            .from('daily_check_ins')
            .select('feeling')
            .eq('user_id', user.id)
            .eq('program_id', program.id)
            .order('date', { ascending: false })
            .limit(7)

        recentFeelings = (recentCheckIns as DailyCheckIn[] | null)?.map(c => c.feeling) || []

        // Fetch race if program has race_id
        if (program.race_id) {
            const { data: raceData } = await supabase
                .from('races')
                .select('*')
                .eq('id', program.race_id)
                .single()

            race = raceData as Race | null
        }
    }

    return (
        <DashboardClient
            firstName={profile?.first_name || user.email?.split('@')[0] || 'Runner'}
            program={program as Program | null}
            tracking={tracking}
            isNew={params.new === 'true'}
            hasCheckedInToday={hasCheckedInToday}
            race={race}
            recentFeelings={recentFeelings}
        />
    )
}
