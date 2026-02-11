import { createClient } from '@/lib/supabase/server'
import { generateProgram } from '@/lib/ai/claude'
import { onboardingSchema } from '@/lib/validations/schemas'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json()

        // Validate input
        const validationResult = onboardingSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validationResult.error.issues },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Check rate limit (1 generation per day)
        const { data: existingPrograms } = await supabase
            .from('programs')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)

        if (existingPrograms && existingPrograms.length > 0) {
            const lastCreation = new Date(existingPrograms[0].created_at)
            const hoursSince = (Date.now() - lastCreation.getTime()) / (1000 * 60 * 60)

            if (hoursSince < 24) {
                return NextResponse.json(
                    { error: 'Tu as déjà généré un programme aujourd\'hui. Réessaie demain !' },
                    { status: 429 }
                )
            }
        }

        // Fetch race context if raceId provided
        let raceContext = null
        if (data.raceId) {
            const { data: race } = await supabase
                .from('races')
                .select('*')
                .eq('id', data.raceId)
                .single()

            if (race) {
                raceContext = {
                    name: race.name,
                    distance_km: race.distance_km,
                    elevation_gain_m: race.elevation_gain_m,
                    terrain_type: race.terrain_type,
                    difficulty: race.difficulty,
                    key_points: race.key_points || [],
                    typical_weather: race.typical_weather,
                    date: race.date,
                }
            }
        }

        // Generate program with Claude
        const programData = await generateProgram({
            level: data.level,
            goal: data.goal,
            targetDate: data.hasTargetDate && data.targetDate ? data.targetDate : null,
            sessionsPerWeek: data.sessionsPerWeek,
            referenceTime: data.hasReferenceTime && data.referenceTime ? data.referenceTime : null,
            injuriesNotes: data.injuriesNotes || null,
            raceContext,
        })

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
                level: data.level,
                goal: data.goal,
                target_date: data.hasTargetDate && data.targetDate ? data.targetDate : null,
                sessions_per_week: data.sessionsPerWeek,
                reference_time: data.hasReferenceTime && data.referenceTime ? data.referenceTime : null,
                injuries_notes: data.injuriesNotes || null,
                program_data: programData,
                is_active: true,
                ...(data.raceId ? { race_id: data.raceId } : {}),
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
        console.error('Program generation error:', error)

        if (error instanceof Error) {
            if (error.message.includes('rate_limit')) {
                return NextResponse.json(
                    { error: 'Beaucoup de demandes en ce moment. Réessaie dans 1 minute.' },
                    { status: 429 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Erreur lors de la génération du programme. Réessaie.' },
            { status: 500 }
        )
    }
}
