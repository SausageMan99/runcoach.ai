import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Session, AdjustedSession } from '@/types'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { feeling, sessionWeek, sessionDay } = body

        if (!feeling || !sessionWeek || !sessionDay) {
            return NextResponse.json(
                { error: 'Données manquantes' },
                { status: 400 }
            )
        }

        if (![1, 2, 3].includes(feeling)) {
            return NextResponse.json(
                { error: 'Feeling invalide (1-3)' },
                { status: 400 }
            )
        }

        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Check if already checked in today
        const today = new Date().toISOString().split('T')[0]
        const { data: existingCheckIn } = await supabase
            .from('daily_check_ins')
            .select('id')
            .eq('user_id', user.id)
            .eq('date', today)
            .single()

        if (existingCheckIn) {
            return NextResponse.json(
                { error: 'Tu as déjà fait ton check-in aujourd\'hui' },
                { status: 409 }
            )
        }

        // Get active program
        const { data: program } = await supabase
            .from('programs')
            .select('id, program_data')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single()

        if (!program) {
            return NextResponse.json(
                { error: 'Aucun programme actif' },
                { status: 404 }
            )
        }

        // Get recent check-ins for fatigue streak
        const { data: recentCheckIns } = await supabase
            .from('daily_check_ins')
            .select('feeling, date')
            .eq('user_id', user.id)
            .eq('program_id', program.id)
            .order('date', { ascending: false })
            .limit(7)

        const fatigueStreak = calculateFatigueStreak(recentCheckIns || [])

        // Find current session
        const weekData = program.program_data.weeks?.find(
            (w: { week_number: number }) => w.week_number === sessionWeek
        )
        const sessionData = weekData?.sessions?.find(
            (s: Session) => s.day === sessionDay && !s.rest_day
        )

        let adjustment: AdjustedSession | null = null
        let message: string

        if (feeling === 1) {
            message = 'Super forme ! Donne tout aujourd\'hui !'
        } else if (feeling === 3 || fatigueStreak >= 2) {
            // Very tired or 2+ consecutive tired days → forced rest
            adjustment = {
                original_type: sessionData?.session_type || 'Entraînement',
                adjusted_type: 'Repos actif',
                intensity_reduction: 100,
                message: fatigueStreak >= 2
                    ? 'Fatigue accumulée détectée. Repos forcé pour ta sécurité.'
                    : 'Repos recommandé. Écoute ton corps.',
            }
            message = adjustment.message
        } else {
            // feeling === 2: reduce intensity by 10%
            adjustment = sessionData
                ? adjustSessionIntensity(sessionData)
                : {
                    original_type: 'Entraînement',
                    adjusted_type: 'Entraînement allégé',
                    intensity_reduction: 10,
                    message: 'Séance adaptée : -10% d\'intensité.',
                }
            message = adjustment.message
        }

        // Save check-in
        const sessionId = `${sessionWeek}-${sessionDay}`
        const { error: insertError } = await supabase
            .from('daily_check_ins')
            .insert({
                user_id: user.id,
                program_id: program.id,
                session_id: sessionId,
                feeling,
                adjustment_made: adjustment,
                date: today,
            })

        if (insertError) {
            console.error('Check-in insert error:', insertError)
            return NextResponse.json(
                { error: 'Erreur lors de la sauvegarde' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            adjustment,
            message,
        })
    } catch (error) {
        console.error('Daily check-in error:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}

function calculateFatigueStreak(
    checkIns: { feeling: number; date: string }[]
): number {
    let streak = 0
    for (const checkIn of checkIns) {
        if (checkIn.feeling >= 2) {
            streak++
        } else {
            break
        }
    }
    return streak
}

function adjustSessionIntensity(session: Session): AdjustedSession {
    const adjustedPace = session.pace_target
        ? slowDownPace(session.pace_target)
        : undefined

    return {
        original_type: session.session_type || 'Entraînement',
        adjusted_type: session.session_type === 'Fractionné'
            ? 'Endurance fondamentale'
            : `${session.session_type || 'Entraînement'} allégé`,
        intensity_reduction: 10,
        message: adjustedPace
            ? `Séance adaptée : allure ajustée à ${adjustedPace}.`
            : 'Séance adaptée : -10% d\'intensité.',
    }
}

function slowDownPace(pace: string): string {
    // Parse pace like "5:30/km" and add ~10%
    const match = pace.match(/(\d+):(\d+)/)
    if (!match) return pace

    const minutes = parseInt(match[1])
    const seconds = parseInt(match[2])
    const totalSeconds = minutes * 60 + seconds
    const slowed = Math.round(totalSeconds * 1.1)
    const newMin = Math.floor(slowed / 60)
    const newSec = slowed % 60

    return `${newMin}:${newSec.toString().padStart(2, '0')}/km`
}
