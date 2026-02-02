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
}

export async function generateProgram(input: GenerateProgramInput): Promise<ProgramData> {
    // Calculate weeks available (max 12 for complete generation)
    let weeksAvailable = 12 // Default
    if (input.targetDate) {
        const today = new Date()
        const target = new Date(input.targetDate)
        const diffTime = target.getTime() - today.getTime()
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
        weeksAvailable = Math.max(4, Math.min(12, diffWeeks)) // Between 4 and 12 weeks max
    }

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
