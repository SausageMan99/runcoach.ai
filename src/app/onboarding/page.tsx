'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import ProgramPreview from '@/components/onboarding/program-preview'
import InlineSignup from '@/components/onboarding/inline-signup'
import type { ProgramData } from '@/types'
import type { OnboardingData } from '@/lib/validations/schemas'

const STORAGE_KEY = 'runcoach_onboarding'

const loadingTips = [
    "Analyse de ton profil running...",
    "Calcul de tes allures optimales...",
    "Construction du plan de progression...",
    "Répartition des séances par semaine...",
    "Intégration des phases de récupération...",
    "Presque prêt...",
]

const levels = [
    { value: 'débutant', label: 'Débutant', desc: 'Je cours depuis moins de 6 mois' },
    { value: 'intermédiaire', label: 'Intermédiaire', desc: 'Je cours régulièrement depuis 6+ mois' },
    { value: 'avancé', label: 'Avancé', desc: 'Je cours depuis 2+ ans, compétitions régulières' },
]

const goals = [
    { value: '10k', label: '10K', emoji: '🎯' },
    { value: 'semi', label: 'Semi-marathon', emoji: '🏅' },
    { value: 'marathon', label: 'Marathon', emoji: '🏆' },
    { value: 'improve', label: 'Améliorer mon temps', emoji: '⚡' },
]

const sessionsOptions = [2, 3, 4, 5, 6]

type Phase = 'step1' | 'step2' | 'generating' | 'program' | 'signup'

export default function OnboardingPage() {
    const router = useRouter()
    const [phase, setPhase] = useState<Phase>('step1')
    const [currentTip, setCurrentTip] = useState(0)
    const [generatedProgram, setGeneratedProgram] = useState<ProgramData | null>(null)
    const [generationError, setGenerationError] = useState<string | null>(null)

    // Step 1 fields
    const [level, setLevel] = useState<string>('')
    const [goalType, setGoalType] = useState<string>('')
    const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(3)
    const [hasTargetDate, setHasTargetDate] = useState(false)
    const [targetDate, setTargetDate] = useState<string>('')
    const [hasReferenceTime, setHasReferenceTime] = useState(false)
    const [referenceTime, setReferenceTime] = useState<string>('')

    // Step 2 fields
    const [injuriesNotes, setInjuriesNotes] = useState<string>('')

    // Rotate loading tips
    useEffect(() => {
        if (phase !== 'generating') return
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % loadingTips.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [phase])

    const goalLabel = (gt: string) => {
        switch (gt) {
            case '10k': return 'Finir mon premier 10K'
            case 'semi': return 'Semi-marathon (21K)'
            case 'marathon': return 'Marathon (42K)'
            case 'improve': return 'Améliorer mon temps de course'
            default: return 'Finir mon premier 10K'
        }
    }

    const canProceedStep1 = level && goalType

    const buildOnboardingData = (): OnboardingData => ({
        level: level as OnboardingData['level'],
        goal: goalLabel(goalType),
        goalType: goalType as OnboardingData['goalType'],
        sessionsPerWeek,
        hasTargetDate,
        targetDate: hasTargetDate ? targetDate : undefined,
        hasReferenceTime,
        referenceTime: hasReferenceTime ? referenceTime : undefined,
        injuriesNotes: injuriesNotes || undefined,
    })

    const generateProgram = async () => {
        const data = buildOnboardingData()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setPhase('generating')
        setGenerationError(null)

        try {
            const response = await fetch('/api/generate-program-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la génération')
            }

            setGeneratedProgram(result.program)
            setPhase('program')
            localStorage.removeItem(STORAGE_KEY)
        } catch (err) {
            console.error('Generation error:', err)
            setGenerationError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.')
            setPhase('step2')
        }
    }

    // Generating phase
    if (phase === 'generating') {
        return (
            <div className="min-h-screen bg-background flex flex-col relative overflow-hidden topo-pattern">
                <header className="relative z-10 p-4 sm:p-6">
                    <Link href="/">
                        <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    </Link>
                </header>

                <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-md text-center space-y-8">
                        <div className="relative w-40 h-40 mx-auto">
                            <div className="absolute inset-0 rounded-full border-2 border-forest/20 animate-[concentric-pulse_3s_ease-out_infinite]" />
                            <div className="absolute inset-4 rounded-full border-2 border-forest/30 animate-[concentric-pulse_3s_ease-out_0.5s_infinite]" />
                            <div className="absolute inset-8 rounded-full border-2 border-forest/40 animate-[concentric-pulse_3s_ease-out_1s_infinite]" />
                            <div className="absolute inset-12 rounded-full bg-forest/10 animate-pulse-soft flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-forest flex items-center justify-center border-2 border-forest-dim" style={{ boxShadow: '3px 3px 0px #1A1A1A' }}>
                                    <span className="text-3xl">🏃</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="font-serif text-3xl">G&eacute;n&eacute;ration en cours</h2>
                            <p className="text-muted-foreground transition-all duration-500 min-h-[1.5rem]">
                                {loadingTips[currentTip]}
                            </p>
                        </div>

                        <div className="w-48 h-1.5 mx-auto rounded-full bg-muted overflow-hidden">
                            <div className="h-full w-1/2 rounded-full bg-forest animate-[shimmer_1.5s_ease-in-out_infinite]" />
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Cela peut prendre jusqu&apos;&agrave; 30 secondes
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    // Program preview phase
    if (phase === 'program' && generatedProgram) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="p-4 sm:p-6">
                    <Link href="/">
                        <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    </Link>
                </header>

                <main className="flex-1 p-4 sm:p-6 pb-12">
                    <ProgramPreview
                        program={generatedProgram}
                        onSignup={() => setPhase('signup')}
                    />
                </main>

                <footer className="p-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Joggeur
                </footer>
            </div>
        )
    }

    // Signup phase
    if (phase === 'signup' && generatedProgram) {
        const data = buildOnboardingData()
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <header className="p-4 sm:p-6">
                    <Link href="/">
                        <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    </Link>
                </header>

                <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                    <InlineSignup
                        programData={generatedProgram}
                        onboardingData={data}
                    />
                </main>

                <footer className="p-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Joggeur
                </footer>
            </div>
        )
    }

    // Main onboarding flow
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
                <Link href="/">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                </Link>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-8 rounded-full transition-colors ${phase === 'step1' || phase === 'step2' ? 'bg-forest' : 'bg-muted'}`} />
                    <div className={`h-2 w-8 rounded-full transition-colors ${phase === 'step2' ? 'bg-forest' : 'bg-muted'}`} />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 pb-12">
                <div className="max-w-2xl mx-auto">
                    {/* Generation error */}
                    {generationError && (
                        <div className="mb-6 p-4 card-brutal flex items-start gap-3 border-destructive">
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-destructive font-medium">{generationError}</p>
                                <button
                                    type="button"
                                    onClick={() => setGenerationError(null)}
                                    className="text-xs text-muted-foreground hover:text-foreground mt-1"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 1: 6 questions on one scrollable page */}
                    {phase === 'step1' && (
                        <div className="space-y-10 animate-fade-in">
                            <div>
                                <h1 className="font-serif text-3xl sm:text-4xl mb-2">Parle-nous de toi</h1>
                                <p className="text-slate">6 questions rapides pour g&eacute;n&eacute;rer ton programme.</p>
                            </div>

                            {/* Q1: Level */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold">1. Quel est ton niveau ?</Label>
                                <div className="grid gap-3">
                                    {levels.map((l) => (
                                        <button
                                            key={l.value}
                                            type="button"
                                            onClick={() => setLevel(l.value)}
                                            className={`card-brutal p-4 text-left transition-all ${level === l.value ? 'border-forest bg-forest/5 !shadow-[4px_4px_0px_#2D5016]' : ''}`}
                                        >
                                            <p className="font-bold">{l.label}</p>
                                            <p className="text-sm text-slate">{l.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q2: Goal */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold">2. Quel est ton objectif ?</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {goals.map((g) => (
                                        <button
                                            key={g.value}
                                            type="button"
                                            onClick={() => setGoalType(g.value)}
                                            className={`card-brutal p-4 text-left transition-all ${goalType === g.value ? 'border-forest bg-forest/5 !shadow-[4px_4px_0px_#2D5016]' : ''}`}
                                        >
                                            <span className="text-2xl">{g.emoji}</span>
                                            <p className="font-bold mt-1">{g.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q3: Sessions per week */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold">3. Combien de s&eacute;ances par semaine ?</Label>
                                <div className="flex gap-3">
                                    {sessionsOptions.map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setSessionsPerWeek(n)}
                                            className={`card-brutal w-14 h-14 flex items-center justify-center text-lg font-bold transition-all ${sessionsPerWeek === n ? 'border-forest bg-forest text-white !shadow-[4px_4px_0px_#1A3009]' : ''}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Q4: Target date */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold">4. Tu vises une date de course ?</Label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setHasTargetDate(true)}
                                        className={`card-brutal px-6 py-3 font-bold transition-all ${hasTargetDate ? 'border-forest bg-forest/5 !shadow-[4px_4px_0px_#2D5016]' : ''}`}
                                    >
                                        Oui
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setHasTargetDate(false); setTargetDate('') }}
                                        className={`card-brutal px-6 py-3 font-bold transition-all ${!hasTargetDate ? 'border-forest bg-forest/5 !shadow-[4px_4px_0px_#2D5016]' : ''}`}
                                    >
                                        Non
                                    </button>
                                </div>
                                {hasTargetDate && (
                                    <Input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="max-w-xs border-2 border-foreground/20 rounded-lg"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                )}
                            </div>

                            {/* Q5: Reference time */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold">5. Un temps de r&eacute;f&eacute;rence r&eacute;cent ?</Label>
                                <p className="text-sm text-slate">Ex: &laquo;&nbsp;48min au 10K&nbsp;&raquo; ou &laquo;&nbsp;1h55 au semi&nbsp;&raquo;</p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setHasReferenceTime(true)}
                                        className={`card-brutal px-6 py-3 font-bold transition-all ${hasReferenceTime ? 'border-forest bg-forest/5 !shadow-[4px_4px_0px_#2D5016]' : ''}`}
                                    >
                                        Oui
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setHasReferenceTime(false); setReferenceTime('') }}
                                        className={`card-brutal px-6 py-3 font-bold transition-all ${!hasReferenceTime ? 'border-forest bg-forest/5 !shadow-[4px_4px_0px_#2D5016]' : ''}`}
                                    >
                                        Non
                                    </button>
                                </div>
                                {hasReferenceTime && (
                                    <Input
                                        type="text"
                                        value={referenceTime}
                                        onChange={(e) => setReferenceTime(e.target.value)}
                                        placeholder="Ex: 48min au 10K"
                                        className="max-w-xs border-2 border-foreground/20 rounded-lg"
                                    />
                                )}
                            </div>

                            {/* Q6: Preferred days (informational, not stored) */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold">6. Jours pr&eacute;f&eacute;r&eacute;s pour courir ?</Label>
                                <p className="text-sm text-slate">Le programme s&apos;adaptera automatiquement &agrave; ta dispo.</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                                        <span key={day} className="card-brutal px-4 py-2 text-sm font-medium cursor-default">
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Continue button */}
                            <div className="pt-4">
                                <Button
                                    onClick={() => setPhase('step2')}
                                    disabled={!canProceedStep1}
                                    className="w-full sm:w-auto rounded-lg bg-forest text-white font-semibold px-8 py-6 hover:bg-forest-dim transition-all border-2 border-forest disabled:opacity-50"
                                    size="lg"
                                    style={{ boxShadow: canProceedStep1 ? '4px 4px 0px #1A1A1A' : 'none' }}
                                >
                                    Continuer
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Precautions + Generate */}
                    {phase === 'step2' && (
                        <div className="space-y-10 animate-fade-in">
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setPhase('step1')}
                                    className="flex items-center gap-2 text-sm text-slate hover:text-foreground mb-4 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour
                                </button>
                                <h1 className="font-serif text-3xl sm:text-4xl mb-2">Pr&eacute;cautions</h1>
                                <p className="text-slate">Derni&egrave;re &eacute;tape avant la g&eacute;n&eacute;ration de ton programme.</p>
                            </div>

                            {/* Injuries / Notes */}
                            <div className="space-y-3">
                                <Label className="text-base font-bold">Blessures ou pr&eacute;cautions particuli&egrave;res ?</Label>
                                <p className="text-sm text-slate">
                                    Tendinite, douleur au genou, reprise apr&egrave;s arr&ecirc;t... Tout ce que le programme doit prendre en compte.
                                </p>
                                <textarea
                                    value={injuriesNotes}
                                    onChange={(e) => setInjuriesNotes(e.target.value)}
                                    placeholder="Ex: Tendinite d'Achille il y a 3 mois, je reprends doucement..."
                                    className="w-full min-h-[120px] p-4 border-2 border-foreground/20 rounded-lg bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-forest transition-colors"
                                    maxLength={500}
                                />
                                <p className="text-xs text-grey text-right">{injuriesNotes.length}/500</p>
                            </div>

                            {/* Summary */}
                            <div className="card-brutal p-6 space-y-3">
                                <h3 className="font-bold">R&eacute;capitulatif</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-slate">Niveau</p>
                                        <p className="font-bold capitalize">{level}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate">Objectif</p>
                                        <p className="font-bold">{goals.find(g => g.value === goalType)?.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate">S&eacute;ances/semaine</p>
                                        <p className="font-bold">{sessionsPerWeek}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate">Date cible</p>
                                        <p className="font-bold">{hasTargetDate && targetDate ? new Date(targetDate).toLocaleDateString('fr-FR') : 'Pas de date'}</p>
                                    </div>
                                    {hasReferenceTime && referenceTime && (
                                        <div className="col-span-2">
                                            <p className="text-slate">Temps de r&eacute;f&eacute;rence</p>
                                            <p className="font-bold">{referenceTime}</p>
                                        </div>
                                    )}
                                    {injuriesNotes && (
                                        <div className="col-span-2">
                                            <p className="text-slate">Pr&eacute;cautions</p>
                                            <p className="font-bold">{injuriesNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Generate button */}
                            <Button
                                onClick={generateProgram}
                                className="w-full rounded-lg bg-forest text-white font-semibold px-8 py-6 hover:bg-forest-dim transition-all border-2 border-forest text-lg"
                                size="lg"
                                style={{ boxShadow: '4px 4px 0px #1A1A1A' }}
                            >
                                G&eacute;n&eacute;rer mon programme
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="p-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Joggeur
            </footer>
        </div>
    )
}
