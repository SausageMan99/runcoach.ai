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

    // Dynamic model selection based on program length
    // Haiku 3.5 max output is ~8192 tokens — insufficient for >10 weeks of JSON
    const model = weeksAvailable > 10
        ? 'claude-sonnet-4-5-20250929'
        : 'claude-3-5-haiku-20241022'
    const maxTokens = weeksAvailable > 10 ? 16384 : 8000

    console.log(`Generating ${weeksAvailable}-week program with ${model} (max ${maxTokens} tokens)`)

    try {
        const message = await anthropic.messages.create({
            model,
            max_tokens: maxTokens,
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

        // Validate week count — critical for long programs
        if (programData.weeks.length < weeksAvailable) {
            console.warn(`Only ${programData.weeks.length}/${weeksAvailable} weeks generated — program is incomplete`)
            throw new Error('Incomplete program')
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

        // Retry once on parsing errors or incomplete programs
        if (error instanceof SyntaxError || (error instanceof Error && error.message === 'Incomplete program')) {
            console.log('Program generation issue, attempting retry...')
            return retryGeneration(input, weeksAvailable)
        }

        throw error
    }
}

async function retryGeneration(input: GenerateProgramInput, weeksAvailable: number): Promise<ProgramData> {
    // Always use Sonnet for retry to maximize token budget
    const model = 'claude-sonnet-4-5-20250929'
    const maxTokens = 16384

    console.log(`Retrying with ${model} (${maxTokens} tokens)`)

    const prompt = programGenerationPrompt({
        ...input,
        weeksAvailable,
    }) + `\n\nIMPORTANT: Assure-toi de retourner un JSON valide et complet avec EXACTEMENT ${weeksAvailable} semaines.`

    const message = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
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
        const programData: ProgramData = JSON.parse(jsonMatch[0])
        if (programData.weeks.length < weeksAvailable) {
            console.warn(`Retry: only ${programData.weeks.length}/${weeksAvailable} weeks generated`)
        }
        return programData
    }

    throw new Error('Failed to parse JSON after retry')
}
