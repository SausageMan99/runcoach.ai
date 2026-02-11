export interface InjuryRiskInput {
    currentWeekVolume: number
    lastWeekVolume: number
    intenseSessions: number // this week
    totalSessions: number // this week
    recentFeelings: number[] // last 7 check-ins (1=good, 2=tired, 3=very tired)
    hasStrengthWork: boolean
    restDaysThisWeek: number
}

export interface RiskFactor {
    name: string
    score: number
    maxScore: number
    icon: string
    description: string
}

export interface InjuryRiskResult {
    score: number
    level: 'low' | 'medium' | 'high'
    factors: RiskFactor[]
    recommendations: string[]
}

export function calculateInjuryRisk(input: InjuryRiskInput): InjuryRiskResult {
    const factors: RiskFactor[] = []
    const recommendations: string[] = []

    // 1. Volume spike (0-30)
    let volumeScore = 0
    if (input.lastWeekVolume > 0) {
        const increase = ((input.currentWeekVolume - input.lastWeekVolume) / input.lastWeekVolume) * 100
        if (increase > 20) volumeScore = Math.min(30, Math.round(increase - 10))
        if (increase > 15) recommendations.push('Réduis le volume de 10% la semaine prochaine')
    }
    factors.push({
        name: 'Pic de volume',
        score: volumeScore,
        maxScore: 30,
        icon: '📈',
        description: input.lastWeekVolume > 0
            ? `+${Math.round(((input.currentWeekVolume - input.lastWeekVolume) / input.lastWeekVolume) * 100)}% vs semaine précédente`
            : 'Pas de données précédentes',
    })

    // 2. Intensity ratio (0-20)
    let intensityScore = 0
    if (input.totalSessions > 0) {
        const ratio = input.intenseSessions / input.totalSessions
        if (ratio > 0.2) intensityScore = Math.min(20, Math.round((ratio - 0.2) * 100))
        if (ratio > 0.3) recommendations.push('Trop de séances intenses - ajoute plus d\'endurance')
    }
    factors.push({
        name: 'Ratio intensité',
        score: intensityScore,
        maxScore: 20,
        icon: '⚡',
        description: `${input.intenseSessions}/${input.totalSessions} séances intenses`,
    })

    // 3. Fatigue level from check-ins (0-25)
    let fatigueScore = 0
    if (input.recentFeelings.length > 0) {
        const avgFeeling = input.recentFeelings.reduce((a, b) => a + b, 0) / input.recentFeelings.length
        fatigueScore = Math.min(25, Math.round((avgFeeling - 1) * 12.5))
        if (avgFeeling > 1.5) recommendations.push('Fatigue élevée - privilégie la récupération')
    }
    factors.push({
        name: 'Niveau de fatigue',
        score: fatigueScore,
        maxScore: 25,
        icon: '😴',
        description: input.recentFeelings.length > 0
            ? `Moyenne récente : ${(input.recentFeelings.reduce((a, b) => a + b, 0) / input.recentFeelings.length).toFixed(1)}/3`
            : 'Aucun check-in récent',
    })

    // 4. Strength work missing (0-15)
    const strengthScore = input.hasStrengthWork ? 0 : 15
    if (!input.hasStrengthWork) {
        recommendations.push('Ajoute du renforcement musculaire (2x/semaine)')
    }
    factors.push({
        name: 'Renforcement',
        score: strengthScore,
        maxScore: 15,
        icon: '🏋️',
        description: input.hasStrengthWork ? 'Renforcement inclus' : 'Pas de renforcement détecté',
    })

    // 5. Rest days missing (0-10)
    let restScore = 0
    if (input.restDaysThisWeek < 2) {
        restScore = input.restDaysThisWeek === 0 ? 10 : 5
        recommendations.push('Prévois au moins 2 jours de repos par semaine')
    }
    factors.push({
        name: 'Repos insuffisant',
        score: restScore,
        maxScore: 10,
        icon: '🛌',
        description: `${input.restDaysThisWeek} jour${input.restDaysThisWeek > 1 ? 's' : ''} de repos cette semaine`,
    })

    const totalScore = factors.reduce((acc, f) => acc + f.score, 0)
    const level: InjuryRiskResult['level'] = totalScore <= 30 ? 'low' : totalScore <= 60 ? 'medium' : 'high'

    return {
        score: totalScore,
        level,
        factors,
        recommendations: recommendations.slice(0, 3),
    }
}
