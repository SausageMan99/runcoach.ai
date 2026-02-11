import Anthropic from '@anthropic-ai/sdk'
import { programGenerationPrompt } from './prompts'
import type { ProgramData } from '@/types'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GenerateProgramInput {
    level: string
    goal: string
    targetDate: string | null
    sessionsPerWeek: number
    referenceTime: string | null
    injuriesNotes: string | null
    raceContext?: {
        name: string
        distance_km: number
        elevation_gain_m: number
        terrain_type: string
        difficulty: string
        key_points: string[]
        typical_weather: string | null
        date: string
    } | null
}

export async function generateProgram(input: GenerateProgramInput): Promise<ProgramData> {
    // Calculate weeks available based on level, goal, and target date
    let weeksAvailable: number

    if (input.targetDate) {
        // If target date is specified, calculate weeks and cap based on goal
        const today = new Date()
        const target = new Date(input.targetDate)
        const diffTime = target.getTime() - today.getTime()
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))

        // Set min/max based on goal
        let minWeeks = 8, maxWeeks = 16
        const goalLower = input.goal.toLowerCase()
        if (goalLower.includes('5k')) {
            minWeeks = 6; maxWeeks = 12
        } else if (goalLower.includes('10k')) {
            minWeeks = 8; maxWeeks = 14
        } else if (goalLower.includes('semi')) {
            minWeeks = 12; maxWeeks = 18
        } else if (goalLower.includes('marathon')) {
            minWeeks = 14; maxWeeks = 20
        }

        weeksAvailable = Math.max(minWeeks, Math.min(diffWeeks, maxWeeks))
    } else {
        // No target date: smart duration based on level AND goal
        const goalLower = input.goal.toLowerCase()

        if (input.level === 'débutant') {
            if (goalLower.includes('5k')) weeksAvailable = 8
            else if (goalLower.includes('10k')) weeksAvailable = 10
            else if (goalLower.includes('semi')) weeksAvailable = 14
            else weeksAvailable = 12
        } else if (input.level === 'intermédiaire') {
            if (goalLower.includes('5k')) weeksAvailable = 6
            else if (goalLower.includes('10k')) weeksAvailable = 10
            else if (goalLower.includes('semi')) weeksAvailable = 14
            else if (goalLower.includes('marathon')) weeksAvailable = 18
            else weeksAvailable = 12
        } else { // avancé
            if (goalLower.includes('10k')) weeksAvailable = 8
            else if (goalLower.includes('semi')) weeksAvailable = 12
            else if (goalLower.includes('marathon')) weeksAvailable = 18
            else weeksAvailable = 12
        }
    }

    // Max cap: 20 weeks (5 months) for engagement
    weeksAvailable = Math.min(weeksAvailable, 20)

    const prompt = programGenerationPrompt({
        ...input,
        weeksAvailable,
    })

    try {
        const message = await anthropic.messages.create({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 8000,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        })

        // Extract the text content
        const textContent = message.content.find((c) => c.type === 'text')
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text content in response')
        }

        // Parse JSON from response
        const jsonText = textContent.text.trim()

        // Try to extract JSON if there's extra text
        let jsonToParse = jsonText
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            jsonToParse = jsonMatch[0]
        }

        const programData: ProgramData = JSON.parse(jsonToParse)

        // Validate basic structure
        if (!programData.weeks || !Array.isArray(programData.weeks)) {
            throw new Error('Invalid program structure: missing weeks array')
        }

        // Validate sessions per week count
        for (const week of programData.weeks) {
            const trainingSessions = week.sessions.filter(s => !s.rest_day).length
            if (trainingSessions !== input.sessionsPerWeek) {
                console.warn(
                    `Week ${week.week_number} has ${trainingSessions} sessions instead of ${input.sessionsPerWeek}. Adjusting user_profile value.`
                )
                // Update the user_profile to match what was actually generated
                programData.user_profile.sessions_per_week = trainingSessions
            }
        }

        return programData
    } catch (error) {
        console.error('Error generating program:', error)

        // If it's a parsing error, retry once
        if (error instanceof SyntaxError) {
            console.log('JSON parsing failed, attempting retry...')
            return retryGeneration(input, weeksAvailable)
        }

        throw error
    }
}

async function retryGeneration(input: GenerateProgramInput, weeksAvailable: number): Promise<ProgramData> {
    const prompt = programGenerationPrompt({
        ...input,
        weeksAvailable,
    }) + '\n\nIMPORTANT: Assure-toi de retourner un JSON valide et complet.'

    const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 8000,
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in retry response')
    }

    const jsonText = textContent.text.trim()
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
    }

    throw new Error('Failed to parse JSON after retry')
}
