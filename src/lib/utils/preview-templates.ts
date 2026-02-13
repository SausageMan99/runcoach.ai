export interface PreviewProgram {
    objective: string
    weeks: number
    sessionsPerWeek: number
    sampleWeek: string[]
}

const templates: Record<string, PreviewProgram> = {
    '10k': {
        objective: '10 km',
        weeks: 10,
        sessionsPerWeek: 3,
        sampleWeek: [
            'Mardi : Endurance 30min',
            'Jeudi : Fractionné court',
            'Dimanche : Sortie longue 45min',
        ],
    },
    semi: {
        objective: 'Semi-marathon',
        weeks: 14,
        sessionsPerWeek: 3,
        sampleWeek: [
            'Mardi : Endurance 45min',
            'Jeudi : Fractionné',
            'Dimanche : Sortie longue 1h15',
        ],
    },
    marathon: {
        objective: 'Marathon',
        weeks: 18,
        sessionsPerWeek: 4,
        sampleWeek: [
            'Mardi : Endurance 45min',
            'Jeudi : Fractionné / Seuil',
            'Samedi : Endurance active 30min',
            'Dimanche : Sortie longue 1h30',
        ],
    },
    improve: {
        objective: 'Progresser',
        weeks: 12,
        sessionsPerWeek: 3,
        sampleWeek: [
            'Mardi : Endurance fondamentale 40min',
            'Jeudi : Séance qualité (VMA / Seuil)',
            'Dimanche : Sortie longue 1h',
        ],
    },
}

export function getPreviewProgram(objective: string): PreviewProgram {
    return templates[objective] || templates['10k']
}
