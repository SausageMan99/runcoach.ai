import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProgramClient from './program-client'
import type { Program, SessionTracking, AdjustedSession } from '@/types'

export default async function ProgramPage() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Get active program
    const { data: program } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

    if (!program) {
        redirect('/dashboard')
    }

    // Get tracking data
    const { data: trackingData } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('program_id', program.id)

    // Get check-ins with adjustments for this program
    const { data: checkInsData } = await supabase
        .from('daily_check_ins')
        .select('session_id, feeling, adjustment_made, date')
        .eq('program_id', program.id)

    const checkIns = (checkInsData || []).map(c => ({
        session_id: c.session_id as string,
        feeling: c.feeling as number,
        adjustment_made: c.adjustment_made as AdjustedSession | null,
        date: c.date as string,
    }))

    return (
        <ProgramClient
            program={program as Program}
            tracking={trackingData || []}
            checkIns={checkIns}
        />
    )
}
