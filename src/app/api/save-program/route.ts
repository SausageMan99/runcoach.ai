import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const { programData, level, goal, targetDate, sessionsPerWeek, referenceTime, injuriesNotes, raceId } = body

        if (!programData || !level || !goal) {
            return NextResponse.json(
                { error: 'Données manquantes' },
                { status: 400 }
            )
        }

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Deactivate any existing programs
        await supabase
            .from('programs')
            .update({ is_active: false })
            .eq('user_id', user.id)

        // Save program to database
        const { data: program, error: insertError } = await supabase
            .from('programs')
            .insert({
                user_id: user.id,
                level,
                goal,
                target_date: targetDate || null,
                sessions_per_week: sessionsPerWeek,
                reference_time: referenceTime || null,
                injuries_notes: injuriesNotes || null,
                program_data: programData,
                is_active: true,
                ...(raceId ? { race_id: raceId } : {}),
            })
            .select()
            .single()

        if (insertError) {
            console.error('Database insert error:', insertError)
            return NextResponse.json(
                { error: 'Erreur lors de la sauvegarde du programme' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            programId: program.id,
        })
    } catch (error) {
        console.error('Save program error:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la sauvegarde' },
            { status: 500 }
        )
    }
}
