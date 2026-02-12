import { generateProgram } from '@/lib/ai/claude'
import { onboardingSchema } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Simple in-memory rate limit by IP (resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 })
        return true
    }

    if (entry.count >= 3) {
        return false
    }

    entry.count++
    return true
}

export async function POST(request: Request) {
    try {
        // Rate limit by IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown'

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Trop de générations aujourd\'hui. Réessaie demain !' },
                { status: 429 }
            )
        }

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

        // Fetch race context if raceId provided (use server client)
        let raceContext = null
        if (data.raceId) {
            const supabase = await createClient()
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

        // Build race context from custom race data if provided
        if (!raceContext && data.customRace) {
            raceContext = {
                name: data.customRace.name,
                distance_km: data.customRace.distance_km,
                elevation_gain_m: data.customRace.elevation_gain_m || 0,
                terrain_type: data.customRace.terrain_type || 'route',
                difficulty: 'moyen' as const,
                key_points: [],
                typical_weather: null,
                date: data.customRace.date || data.targetDate || null,
            }
        }

        // Generate program with Claude (reuse existing function)
        const programData = await generateProgram({
            level: data.level,
            goal: data.goal,
            targetDate: data.hasTargetDate && data.targetDate ? data.targetDate : null,
            sessionsPerWeek: data.sessionsPerWeek,
            referenceTime: data.hasReferenceTime && data.referenceTime ? data.referenceTime : null,
            injuriesNotes: data.injuriesNotes || null,
            raceContext,
        })

        // Return program WITHOUT saving to DB
        return NextResponse.json({
            program: programData,
            preview: true,
        })
    } catch (error) {
        console.error('Preview generation error:', error)

        if (error instanceof Error && error.message.includes('rate_limit')) {
            return NextResponse.json(
                { error: 'Beaucoup de demandes en ce moment. Réessaie dans 1 minute.' },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: 'Erreur lors de la génération du programme. Réessaie.' },
            { status: 500 }
        )
    }
}
