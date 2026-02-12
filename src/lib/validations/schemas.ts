import { z } from 'zod'

export const onboardingSchema = z.object({
    level: z.enum(['débutant', 'intermédiaire', 'avancé'], {
        message: 'Sélectionne ton niveau',
    }),
    goal: z.string().min(3, 'Sélectionne un objectif').max(200),
    goalType: z.enum(['5k', '10k', 'semi', 'marathon', 'improve']).optional(),
    targetDate: z.string().optional(),
    hasTargetDate: z.boolean().optional(),
    sessionsPerWeek: z.number().int().min(2).max(7, 'Maximum 7 séances par semaine'),
    referenceTime: z.string().max(100).optional(),
    hasReferenceTime: z.boolean().optional(),
    injuriesNotes: z.string().max(500).optional(),
    raceId: z.string().uuid().optional(),
    raceName: z.string().max(200).optional(),
    customRace: z.object({
        name: z.string().min(1).max(200),
        city: z.string().max(100).optional(),
        date: z.string().optional(),
        distance_km: z.number().min(0.1).max(500),
        elevation_gain_m: z.number().min(0).max(20000).optional(),
        terrain_type: z.enum(['route', 'trail', 'mixte']).optional(),
    }).optional(),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

export const signupSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    firstName: z.string().min(1, 'Prénom requis').max(50).optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: 'Tu dois accepter les CGU',
    }),
})

export type SignupData = z.infer<typeof signupSchema>

export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
})

export type LoginData = z.infer<typeof loginSchema>

export const customRaceSchema = z.object({
    name: z.string().min(1, 'Nom de la course requis').max(200),
    city: z.string().max(100).optional(),
    date: z.string().min(1, 'Date requise'),
    distanceKm: z.string().min(1, 'Distance requise').refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        { message: 'Distance invalide' }
    ),
    elevationGain: z.string().optional(),
    terrainType: z.enum(['route', 'trail', 'mixte']),
})

export type CustomRaceFormData = z.infer<typeof customRaceSchema>

export const profileSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
})

export type ProfileData = z.infer<typeof profileSchema>

export const trackingSchema = z.object({
    programId: z.string().uuid(),
    weekNumber: z.number().int().min(1).max(24),
    sessionDay: z.string(),
    completed: z.boolean(),
    notes: z.string().max(500).optional(),
})

export type TrackingData = z.infer<typeof trackingSchema>
