import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'
import type { Program, SessionTracking } from '@/types'

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
    if (program) {
        const { data: trackingData } = await supabase
            .from('session_tracking')
            .select('*')
            .eq('program_id', program.id)

        tracking = trackingData || []
    }

    return (
        <DashboardClient
            firstName={profile?.first_name || user.email?.split('@')[0] || 'Runner'}
            program={program as Program | null}
            tracking={tracking}
            isNew={params.new === 'true'}
        />
    )
}
