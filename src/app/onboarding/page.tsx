'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, type OnboardingData } from '@/lib/validations/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, ArrowRight, Zap, AlertCircle } from 'lucide-react'
import RaceAutocomplete from '@/components/onboarding/race-autocomplete'
import ProgramPreview from '@/components/onboarding/program-preview'
import InlineSignup from '@/components/onboarding/inline-signup'
import type { Race, ProgramData } from '@/types'

const STORAGE_KEY = 'runcoach_onboarding'

const questions = [
    {
        id: 'level',
        title: 'Quel est ton niveau en running ?',
        subtitle: 'On part de TON niveau réel — pas d\'estimation optimiste',
    },
    {
        id: 'goal',
        title: 'Quel est ton objectif ?',
        subtitle: 'Dis-nous ce que tu veux accomplir',
    },
    {
        id: 'race',
        title: 'Tu prépares une course ?',
        subtitle: 'On calibre sur le terrain, dénivelé et météo de TA course',
    },
    {
        id: 'targetDate',
        title: 'Quand veux-tu être prêt ?',
        subtitle: '12-16 semaines pour un objectif ambitieux',
    },
    {
        id: 'sessionsPerWeek',
        title: 'Combien de séances par semaine ?',
        subtitle: 'Sois réaliste avec ton emploi du temps',
    },
    {
        id: 'referenceTime',
        title: 'Un temps de référence récent ?',
        subtitle: 'Aide l\'IA à calibrer tes allures optimales',
    },
    {
        id: 'injuries',
        title: 'Des blessures ou précautions ?',
        subtitle: 'On prend tes contraintes en compte',
    },
]

const stepColors = [
    'from-background to-primary/5',
    'from-background to-moss-light/5',
    'from-background to-accent-warm/5',
    'from-background to-success/5',
    'from-background to-primary/5',
    'from-background to-moss-light/5',
    'from-background to-warning/5',
]

const loadingTips = [
    "Analyse de ton profil running...",
    "Calcul de tes allures optimales...",
    "Construction du plan de progression...",
    "Répartition des séances par semaine...",
    "Intégration des phases de récupération...",
    "Presque prêt...",
]

type Phase = 'quiz' | 'generating' | 'preview' | 'signup'

export default function OnboardingPage() {
    const [phase, setPhase] = useState<Phase>('quiz')
    const [step, setStep] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [animDir, setAnimDir] = useState<'next' | 'prev'>('next')
    const [selectedRace, setSelectedRace] = useState<Race | null>(null)
    const [wantsRace, setWantsRace] = useState<boolean | null>(null)
    const [generatedProgram, setGeneratedProgram] = useState<ProgramData | null>(null)
    const [generationError, setGenerationError] = useState<string | null>(null)
    const [currentTip, setCurrentTip] = useState(0)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        trigger,
        formState: { errors }
    } = useForm<OnboardingData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            hasTargetDate: true,
            hasReferenceTime: true,
            sessionsPerWeek: 3,
        }
    })

    const formData = watch()

    // Load saved data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                Object.entries(parsed).forEach(([key, value]) => {
                    setValue(key as keyof OnboardingData, value as OnboardingData[keyof OnboardingData])
                })
            } catch {
                // Invalid data, ignore
            }
        }
    }, [setValue])

    // Save data to localStorage on change
    useEffect(() => {
        if (phase === 'quiz') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
        }
    }, [formData, phase])

    // Rotate loading tips
    useEffect(() => {
        if (phase !== 'generating') return
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % loadingTips.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [phase])

    const progress = ((step + 1) / questions.length) * 100

    const goNext = async () => {
        let isValid = true
        if (step === 0) isValid = await trigger('level')
        if (step === 1) isValid = await trigger(['goal', 'goalType'])
        if (step === 4) isValid = await trigger('sessionsPerWeek')

        if (!isValid) return

        if (step < questions.length - 1) {
            setAnimDir('next')
            setIsAnimating(true)
            setTimeout(() => {
                setStep(step + 1)
                setIsAnimating(false)
            }, 200)
        }
    }

    const goBack = () => {
        if (step > 0) {
            setAnimDir('prev')
            setIsAnimating(true)
            setTimeout(() => {
                setStep(step - 1)
                setIsAnimating(false)
            }, 200)
        }
    }

    const handleRaceSelect = (race: Race & { custom?: boolean }) => {
        setSelectedRace(race)
        if (race.custom) {
            // Custom race: don't set raceId (not in DB), set customRace data
            setValue('raceId', undefined)
            setValue('customRace', {
                name: race.name,
                city: race.city || undefined,
                date: race.date,
                distance_km: race.distance_km,
                elevation_gain_m: race.elevation_gain_m || undefined,
                terrain_type: race.terrain_type || undefined,
            })
        } else {
            setValue('raceId', race.id)
            setValue('customRace', undefined)
        }
        setValue('raceName', race.name)
        setValue('targetDate', race.date)
        setValue('hasTargetDate', true)
    }

    const handleRaceClear = () => {
        setSelectedRace(null)
        setValue('raceId', undefined)
        setValue('raceName', undefined)
        setValue('customRace', undefined)
    }

    const onSubmit = async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
        setPhase('generating')
        setGenerationError(null)

        try {
            const response = await fetch('/api/generate-program-preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la génération')
            }

            setGeneratedProgram(result.program)
            setPhase('preview')
            localStorage.removeItem(STORAGE_KEY)
        } catch (err) {
            console.error('Generation error:', err)
            setGenerationError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessaie.')
            setPhase('quiz')
        }
    }

    // Generating phase
    if (phase === 'generating') {
        return (
            <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent-warm/5 rounded-full blur-3xl" />

                <header className="relative z-10 p-4 sm:p-6">
                    <Link href="/">
                        <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    </Link>
                </header>

                <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-md text-center space-y-8">
                        <div className="relative w-40 h-40 mx-auto">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[concentric-pulse_3s_ease-out_infinite]" />
                            <div className="absolute inset-4 rounded-full border-2 border-primary/30 animate-[concentric-pulse_3s_ease-out_0.5s_infinite]" />
                            <div className="absolute inset-8 rounded-full border-2 border-primary/40 animate-[concentric-pulse_3s_ease-out_1s_infinite]" />
                            <div className="absolute inset-12 rounded-full bg-primary/10 animate-pulse-soft flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-moss-light flex items-center justify-center">
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
                            <div className="h-full w-1/2 rounded-full gradient-accent animate-[shimmer_1.5s_ease-in-out_infinite]" />
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Cela peut prendre jusqu&apos;&agrave; 30 secondes
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    // Preview phase
    if (phase === 'preview' && generatedProgram) {
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
                        onboardingData={formData}
                    />
                </main>

                <footer className="p-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Joggeur
                </footer>
            </div>
        )
    }

    // Quiz phase (default)
    return (
        <div className={`min-h-screen bg-gradient-to-br ${stepColors[step]} transition-colors duration-700 flex flex-col`}>
            {/* Header */}
            <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
                <Link href="/" className="font-serif text-xl text-foreground">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                </Link>
                <span className="text-sm text-muted-foreground font-medium">
                    {step + 1} / {questions.length}
                </span>
            </header>

            {/* Progress bar */}
            <div className="px-4 sm:px-6 relative z-10">
                <div className="h-1 bg-muted rounded-full overflow-hidden max-w-lg mx-auto">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className={`w-full max-w-lg transition-all duration-200 ${isAnimating
                    ? animDir === 'next'
                        ? 'opacity-0 translate-x-8'
                        : 'opacity-0 -translate-x-8'
                    : 'opacity-100 translate-x-0'
                    }`}>

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

                    {/* Question header */}
                    <div className="text-center mb-10 space-y-3">
                        <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-snug">
                            {questions[step].title}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            {questions[step].subtitle}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1: Level */}
                        {step === 0 && (
                            <div className="space-y-3">
                                {[
                                    { value: 'débutant', label: 'Débutant', desc: 'Je commence ou < 6 mois', icon: '🌱' },
                                    { value: 'intermédiaire', label: 'Intermédiaire', desc: 'Je cours depuis 6-24 mois', icon: '🏃' },
                                    { value: 'avancé', label: 'Avancé', desc: '2+ ans, plusieurs courses', icon: '🏆' },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.level === option.value
                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                            : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-sm'
                                            }`}
                                    >
                                        <input type="radio" value={option.value} {...register('level')} className="sr-only" />
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                                            {option.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{option.label}</p>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.level === option.value ? 'border-primary bg-primary' : 'border-muted'}`}>
                                            {formData.level === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </label>
                                ))}
                                {errors.level && <p className="text-sm text-destructive text-center">{errors.level.message}</p>}
                            </div>
                        )}

                        {/* Step 2: Goal */}
                        {step === 1 && (
                            <div className="space-y-3">
                                {[
                                    { value: '5k', label: 'Finir mon premier 5K', icon: '🎯' },
                                    { value: '10k', label: 'Finir mon premier 10K', icon: '🏅' },
                                    { value: 'semi', label: 'Semi-marathon (21K)', icon: '🔥' },
                                    { value: 'marathon', label: 'Marathon (42K)', icon: '🏆' },
                                    { value: 'improve', label: 'Améliorer mon temps', icon: '⚡' },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.goalType === option.value
                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                            : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-sm'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value={option.value}
                                            checked={formData.goalType === option.value}
                                            onChange={(e) => {
                                                setValue('goalType', e.target.value as OnboardingData['goalType'])
                                                const goalText = option.value === 'improve' ? 'Améliorer mon temps de course' : option.label
                                                setValue('goal', goalText)
                                            }}
                                            className="sr-only"
                                        />
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                                            {option.icon}
                                        </div>
                                        <p className="font-semibold flex-1">{option.label}</p>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.goalType === option.value ? 'border-primary bg-primary' : 'border-muted'}`}>
                                            {formData.goalType === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </label>
                                ))}
                                {formData.goalType === 'improve' && (
                                    <div className="pt-2">
                                        <Label htmlFor="improveDistance" className="text-sm">Sur quelle distance ?</Label>
                                        <Input
                                            id="improveDistance"
                                            placeholder="Ex: 10K en moins de 50 min"
                                            className="mt-2 rounded-xl"
                                            onChange={(e) => setValue('goal', `Améliorer mon temps sur ${e.target.value}`)}
                                        />
                                    </div>
                                )}
                                {errors.goal && <p className="text-sm text-destructive text-center mt-2">{errors.goal.message}</p>}
                            </div>
                        )}

                        {/* Step 3: Race */}
                        {step === 2 && (
                            <div className="space-y-4">
                                {wantsRace === null && (
                                    <div className="space-y-3">
                                        <label
                                            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border/50 bg-card cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                                            onClick={() => setWantsRace(true)}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">🏁</div>
                                            <div className="flex-1">
                                                <p className="font-semibold">Oui, je prépare une course</p>
                                                <p className="text-sm text-muted-foreground">Programme adapté au terrain et à la date</p>
                                            </div>
                                        </label>
                                        <label
                                            className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border/50 bg-card cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                                            onClick={() => {
                                                setWantsRace(false)
                                                handleRaceClear()
                                            }}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">🎯</div>
                                            <div className="flex-1">
                                                <p className="font-semibold">Non, objectif général</p>
                                                <p className="text-sm text-muted-foreground">Programme classique selon ton objectif</p>
                                            </div>
                                        </label>
                                    </div>
                                )}
                                {wantsRace === true && (
                                    <div className="space-y-3">
                                        <RaceAutocomplete onSelect={handleRaceSelect} onClear={handleRaceClear} selectedRace={selectedRace} />
                                        <button type="button" onClick={() => { setWantsRace(null); handleRaceClear() }} className="text-sm text-muted-foreground hover:text-foreground underline">
                                            Retour au choix
                                        </button>
                                    </div>
                                )}
                                {wantsRace === false && (
                                    <div className="p-5 rounded-2xl bg-card border border-border/50 text-center">
                                        <p className="text-muted-foreground">Pas de course sélectionnée</p>
                                        <button type="button" onClick={() => setWantsRace(null)} className="text-sm text-primary hover:underline mt-2">
                                            Changer
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Target Date */}
                        {step === 3 && (
                            <div className="space-y-4">
                                {selectedRace ? (
                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20">
                                        <p className="text-sm text-muted-foreground mb-1">Date calée sur ta course</p>
                                        <p className="font-semibold">{selectedRace.name} - {new Date(selectedRace.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="targetDate">Date de l&apos;objectif</Label>
                                            <Input
                                                id="targetDate"
                                                type="date"
                                                disabled={!formData.hasTargetDate}
                                                {...register('targetDate')}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="noDate"
                                                checked={!formData.hasTargetDate}
                                                onCheckedChange={(checked) => {
                                                    setValue('hasTargetDate', !checked)
                                                    if (checked) setValue('targetDate', undefined)
                                                }}
                                            />
                                            <label htmlFor="noDate" className="text-sm cursor-pointer">
                                                Je n&apos;ai pas de date précise
                                            </label>
                                        </div>
                                        <p className="text-sm text-muted-foreground bg-card p-4 rounded-2xl border border-border/50">
                                            On recommande 12-16 semaines pour un objectif ambitieux. Sans date, on génère un programme de 12 semaines.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 5: Sessions per week */}
                        {step === 4 && (
                            <div className="space-y-3">
                                {[
                                    { value: 2, label: '2-3 séances/semaine', desc: 'Sécurité maximale — idéal pour débutants ou reprise', icon: '🌱' },
                                    { value: 4, label: '4 séances/semaine', desc: 'Bon équilibre effort/récup — le sweet spot', icon: '💪' },
                                    { value: 5, label: '5+ séances/semaine', desc: 'Risque blessure accru — réservé aux confirmés', icon: '🔥' },
                                ].map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${formData.sessionsPerWeek === option.value
                                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                            : 'border-border/50 bg-card hover:border-primary/30 hover:shadow-sm'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            value={option.value}
                                            checked={formData.sessionsPerWeek === option.value}
                                            onChange={() => setValue('sessionsPerWeek', option.value)}
                                            className="sr-only"
                                        />
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                                            {option.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{option.label}</p>
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.sessionsPerWeek === option.value ? 'border-primary bg-primary' : 'border-muted'}`}>
                                            {formData.sessionsPerWeek === option.value && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}

                        {/* Step 6: Reference Time */}
                        {step === 5 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="referenceTime">Ton temps de référence (optionnel)</Label>
                                    <Textarea
                                        id="referenceTime"
                                        placeholder="Ex: J'ai fait un 10K en 55 minutes il y a 2 mois"
                                        disabled={!formData.hasReferenceTime}
                                        {...register('referenceTime')}
                                        rows={3}
                                        maxLength={100}
                                        className="rounded-xl"
                                    />
                                    <p className="text-xs text-muted-foreground text-right">{formData.referenceTime?.length || 0}/100</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="noReference"
                                        checked={!formData.hasReferenceTime}
                                        onCheckedChange={(checked) => {
                                            setValue('hasReferenceTime', !checked)
                                            if (checked) setValue('referenceTime', undefined)
                                        }}
                                    />
                                    <label htmlFor="noReference" className="text-sm cursor-pointer">
                                        Je n&apos;ai pas de temps de référence
                                    </label>
                                </div>
                                <p className="text-sm text-muted-foreground bg-card p-4 rounded-2xl border border-border/50">
                                    Un temps récent (&lt; 3 mois) aide l&apos;IA à calculer tes allures optimales.
                                </p>
                            </div>
                        )}

                        {/* Step 7: Injuries */}
                        {step === 6 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="injuries">Blessures ou précautions (optionnel)</Label>
                                    <Textarea
                                        id="injuries"
                                        placeholder="Ex: Douleur genou droit après 10km, tendinite achille il y a 6 mois..."
                                        {...register('injuriesNotes')}
                                        rows={4}
                                        maxLength={500}
                                        className="rounded-xl"
                                    />
                                    <p className="text-xs text-muted-foreground text-right">{formData.injuriesNotes?.length || 0}/500</p>
                                </div>
                                <div className="bg-accent-warm/10 border border-accent-warm/30 rounded-2xl p-4 text-sm text-foreground/80">
                                    <strong>Ces infos sont critiques</strong> — on ajuste vraiment ton programme en fonction. Consulte un médecin si tu as des blessures sérieuses.
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 mt-10">
                            {step > 0 && (
                                <Button type="button" variant="outline" onClick={goBack} className="flex-1 rounded-2xl py-6 border-border/50">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Retour
                                </Button>
                            )}
                            {step < questions.length - 1 ? (
                                <Button type="button" onClick={goNext} className="flex-1 rounded-2xl py-6 bg-primary text-primary-foreground">
                                    Suivant
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button type="submit" className="flex-1 rounded-2xl py-6 bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Générer Mon Programme
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Joggeur
            </footer>
        </div>
    )
}
