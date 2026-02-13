'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertCircle } from 'lucide-react'
import ObjectiveSelector from '@/components/onboarding/ObjectiveSelector'
import ProgramPreviewCard from '@/components/onboarding/ProgramPreviewCard'
import RefinementForm from '@/components/onboarding/RefinementForm'
import ProgramPreview from '@/components/onboarding/program-preview'
import InlineSignup from '@/components/onboarding/inline-signup'
import { getPreviewProgram } from '@/lib/utils/preview-templates'
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

/** Map objective key to goalType + goal text for the API */
function objectiveToGoal(objective: string): { goalType: OnboardingData['goalType']; goal: string } {
    switch (objective) {
        case '10k': return { goalType: '10k', goal: 'Finir mon premier 10K' }
        case 'semi': return { goalType: 'semi', goal: 'Semi-marathon (21K)' }
        case 'marathon': return { goalType: 'marathon', goal: 'Marathon (42K)' }
        case 'improve': return { goalType: 'improve', goal: 'Améliorer mon temps de course' }
        default: return { goalType: '10k', goal: 'Finir mon premier 10K' }
    }
}

type Phase = 'objective' | 'preview' | 'refinement' | 'generating' | 'program' | 'signup'

export default function OnboardingPage() {
    const [phase, setPhase] = useState<Phase>('objective')
    const [selectedObjective, setSelectedObjective] = useState<string | null>(null)
    const [currentTip, setCurrentTip] = useState(0)
    const [generatedProgram, setGeneratedProgram] = useState<ProgramData | null>(null)
    const [generationError, setGenerationError] = useState<string | null>(null)
    const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)

    // Rotate loading tips
    useEffect(() => {
        if (phase !== 'generating') return
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % loadingTips.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [phase])

    const handleObjectiveContinue = () => {
        if (selectedObjective) {
            setPhase('preview')
        }
    }

    /** Accept default plan — use default values and generate */
    const handleAcceptDefault = () => {
        if (!selectedObjective) return
        const { goalType, goal } = objectiveToGoal(selectedObjective)
        const data: OnboardingData = {
            level: 'intermédiaire',
            goal,
            goalType,
            sessionsPerWeek: 3,
            hasTargetDate: false,
            hasReferenceTime: false,
        }
        setOnboardingData(data)
        generateProgram(data)
    }

    /** Customized plan — use refinement data */
    const handleRefinementSubmit = (refinement: { level: string; sessionsPerWeek: number; targetDate?: string }) => {
        if (!selectedObjective) return
        const { goalType, goal } = objectiveToGoal(selectedObjective)
        const data: OnboardingData = {
            level: refinement.level as OnboardingData['level'],
            goal,
            goalType,
            sessionsPerWeek: refinement.sessionsPerWeek,
            targetDate: refinement.targetDate,
            hasTargetDate: !!refinement.targetDate,
            hasReferenceTime: false,
        }
        setOnboardingData(data)
        generateProgram(data)
    }

    const generateProgram = async (data: OnboardingData) => {
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
            setPhase('objective')
        }
    }

    // Generating phase
    if (phase === 'generating') {
        return (
            <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-terracotta-light/10 rounded-full blur-3xl" />

                <header className="relative z-10 p-4 sm:p-6">
                    <Link href="/">
                        <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    </Link>
                </header>

                <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-md text-center space-y-8">
                        <div className="relative w-40 h-40 mx-auto">
                            <div className="absolute inset-0 rounded-full border-2 border-terracotta/20 animate-[concentric-pulse_3s_ease-out_infinite]" />
                            <div className="absolute inset-4 rounded-full border-2 border-terracotta/30 animate-[concentric-pulse_3s_ease-out_0.5s_infinite]" />
                            <div className="absolute inset-8 rounded-full border-2 border-terracotta/40 animate-[concentric-pulse_3s_ease-out_1s_infinite]" />
                            <div className="absolute inset-12 rounded-full bg-terracotta/10 animate-pulse-soft flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center">
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
                            <div className="h-full w-1/2 rounded-full bg-terracotta animate-[shimmer_1.5s_ease-in-out_infinite]" />
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Cela peut prendre jusqu&apos;&agrave; 30 secondes
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    // Program preview phase (AI-generated result)
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
    if (phase === 'signup' && generatedProgram && onboardingData) {
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
                        onboardingData={onboardingData}
                    />
                </main>

                <footer className="p-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Joggeur
                </footer>
            </div>
        )
    }

    // Main onboarding flow
    const preview = selectedObjective ? getPreviewProgram(selectedObjective) : null

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
                <Link href="/">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-2xl">
                    {/* Generation error */}
                    {generationError && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-start gap-3">
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

                    {/* Step 1: Objective selection */}
                    {phase === 'objective' && (
                        <div className="space-y-8">
                            <ObjectiveSelector
                                selected={selectedObjective}
                                onSelect={setSelectedObjective}
                            />
                            <div className="text-center">
                                <Button
                                    onClick={handleObjectiveContinue}
                                    disabled={!selectedObjective}
                                    className="rounded-lg bg-terracotta text-white font-semibold px-8 py-6 hover:bg-terracotta-dark transition-colors disabled:opacity-50"
                                    size="lg"
                                >
                                    Continuer
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Template preview */}
                    {phase === 'preview' && preview && (
                        <ProgramPreviewCard
                            preview={preview}
                            onAccept={handleAcceptDefault}
                            onCustomize={() => setPhase('refinement')}
                        />
                    )}

                    {/* Step 3: Refinement (optional) */}
                    {phase === 'refinement' && (
                        <RefinementForm onSubmit={handleRefinementSubmit} />
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
