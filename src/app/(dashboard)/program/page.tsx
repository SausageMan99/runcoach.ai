import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProgramClient from './program-client'
import type { Program, SessionTracking } from '@/types'

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

    return (
        <ProgramClient
            program={program as Program}
            tracking={trackingData || []}
        />
    )
}
