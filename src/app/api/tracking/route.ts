import { createClient } from '@/lib/supabase/server'
import { trackingSchema } from '@/lib/validations/schemas'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        // Validate input
        const validationResult = trackingSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validationResult.error.issues },
                { status: 400 }
            )
        }

        const data = validationResult.data
        const supabase = await createClient()

        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
        }

        // Check if tracking record exists
        const { data: existing } = await supabase
            .from('session_tracking')
            .select('id')
            .eq('program_id', data.programId)
            .eq('week_number', data.weekNumber)
            .eq('session_day', data.sessionDay)
            .single()

        if (existing) {
            // Update existing
            const { error: updateError } = await supabase
                .from('session_tracking')
                .update({
                    completed: data.completed,
                    completed_at: data.completed ? new Date().toISOString() : null,
                    notes: data.notes,
                })
                .eq('id', existing.id)

            if (updateError) {
                console.error('Update error:', updateError)
                return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
            }
        } else {
            // Insert new
            const { error: insertError } = await supabase
                .from('session_tracking')
                .insert({
                    program_id: data.programId,
                    user_id: user.id,
                    week_number: data.weekNumber,
                    session_day: data.sessionDay,
                    completed: data.completed,
                    completed_at: data.completed ? new Date().toISOString() : null,
                    notes: data.notes,
                })

            if (insertError) {
                console.error('Insert error:', insertError)
                return NextResponse.json({ error: 'Erreur création' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Tracking API error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
