'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, type OnboardingData } from '@/lib/validations/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Zap, Target, Calendar, Clock, Timer, AlertTriangle } from 'lucide-react'

const STORAGE_KEY = 'runcoach_onboarding'

const questions = [
    {
        id: 'level',
        title: 'Quel est ton niveau actuel en running ?',
        description: 'Cela nous aide à adapter ton programme',
        icon: Target,
    },
    {
        id: 'goal',
        title: 'Quel est ton objectif principal ?',
        description: 'Dis-nous ce que tu veux accomplir',
        icon: Target,
    },
    {
        id: 'targetDate',
        title: 'Quand veux-tu atteindre cet objectif ?',
        description: 'On recommande 12-16 semaines pour un objectif ambitieux',
        icon: Calendar,
    },
    {
        id: 'sessionsPerWeek',
        title: 'Combien de séances peux-tu faire par semaine ?',
        description: 'Sois réaliste avec ton emploi du temps',
        icon: Clock,
    },
    {
        id: 'referenceTime',
        title: 'As-tu une référence de temps récente ?',
        description: 'Cela aide l\'IA à calibrer ton niveau exact',
        icon: Timer,
    },
    {
        id: 'injuries',
        title: 'As-tu des blessures ou précautions à prendre ?',
        description: 'Consulte un médecin si tu as des blessures sérieuses',
        icon: AlertTriangle,
    },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    }, [formData])

    const progress = ((step + 1) / questions.length) * 100

    const goNext = async () => {
        // Validate current step
        let isValid = true
        if (step === 0) isValid = await trigger('level')
        if (step === 1) isValid = await trigger(['goal', 'goalType'])
        if (step === 3) isValid = await trigger('sessionsPerWeek')

        if (!isValid) return

        if (step < questions.length - 1) {
            setIsAnimating(true)
            setTimeout(() => {
                setStep(step + 1)
                setIsAnimating(false)
            }, 150)
        }
    }

    const goBack = () => {
        if (step > 0) {
            setIsAnimating(true)
            setTimeout(() => {
                setStep(step - 1)
                setIsAnimating(false)
            }, 150)
        }
    }

    const onSubmit = () => {
        // Save final data and redirect to signup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
        router.push('/signup?redirect=/generate')
    }

    const CurrentIcon = questions[step].icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
            {/* Header */}
            <header className="p-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">RC</span>
                    </div>
                    <span className="font-bold text-xl hidden sm:block">RunCoach<span className="text-primary">.AI</span></span>
                </Link>
                <div className="text-sm text-muted-foreground">
                    Question {step + 1}/{questions.length}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="px-4 pb-4">
                <Progress value={progress} className="h-2" />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className={`w-full max-w-lg shadow-xl border-border/50 transition-all duration-150 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                    }`}>
                    <CardHeader className="text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                            <CurrentIcon className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {questions[step].title}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {questions[step].description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Step 1: Level */}
                            {step === 0 && (
                                <div className="space-y-3">
                                    {[
                                        { value: 'débutant', label: 'Débutant', desc: 'Je commence ou <6 mois d\'expérience', emoji: '🌱' },
                                        { value: 'intermédiaire', label: 'Intermédiaire', desc: 'Je cours régulièrement depuis 6-24 mois', emoji: '🏃' },
                                        { value: 'avancé', label: 'Avancé', desc: 'Je cours depuis 2+ ans, j\'ai fait plusieurs courses', emoji: '🏆' },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.level === option.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value={option.value}
                                                {...register('level')}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl">{option.emoji}</span>
                                            <div className="flex-1">
                                                <p className="font-semibold">{option.label}</p>
                                                <p className="text-sm text-muted-foreground">{option.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.level === option.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                                                }`}>
                                                {formData.level === option.value && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                    {errors.level && (
                                        <p className="text-sm text-red-600">{errors.level.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Goal */}
                            {step === 1 && (
                                <div className="space-y-3">
                                    {[
                                        { value: '5k', label: 'Finir mon premier 5K', emoji: '🎯' },
                                        { value: '10k', label: 'Finir mon premier 10K', emoji: '🏅' },
                                        { value: 'semi', label: 'Courir un semi-marathon (21K)', emoji: '🔥' },
                                        { value: 'marathon', label: 'Courir un marathon (42K)', emoji: '🏆' },
                                        { value: 'improve', label: 'Améliorer mon temps', emoji: '⚡' },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.goalType === option.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value={option.value}
                                                checked={formData.goalType === option.value}
                                                onChange={(e) => {
                                                    setValue('goalType', e.target.value as OnboardingData['goalType'])
                                                    const goalText = option.value === 'improve'
                                                        ? 'Améliorer mon temps de course'
                                                        : option.label
                                                    setValue('goal', goalText)
                                                }}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl">{option.emoji}</span>
                                            <p className="font-semibold flex-1">{option.label}</p>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.goalType === option.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                                                }`}>
                                                {formData.goalType === option.value && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                    {formData.goalType === 'improve' && (
                                        <div className="pt-2">
                                            <Label htmlFor="improveDistance">Sur quelle distance ?</Label>
                                            <Input
                                                id="improveDistance"
                                                placeholder="Ex: 10K en moins de 50 min"
                                                className="mt-2"
                                                onChange={(e) => setValue('goal', `Améliorer mon temps sur ${e.target.value}`)}
                                            />
                                        </div>
                                    )}
                                    {errors.goal && (
                                        <p className="text-sm text-red-600 mt-2">{errors.goal.message}</p>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Target Date */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="targetDate">Date de l&apos;objectif</Label>
                                        <Input
                                            id="targetDate"
                                            type="date"
                                            disabled={!formData.hasTargetDate}
                                            {...register('targetDate')}
                                            min={new Date().toISOString().split('T')[0]}
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
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                        💡 On recommande 12-16 semaines pour un objectif ambitieux.
                                        Si tu n&apos;as pas de date, on te générera un programme de 12 semaines.
                                    </p>
                                </div>
                            )}

                            {/* Step 4: Sessions per week */}
                            {step === 3 && (
                                <div className="space-y-3">
                                    {[
                                        { value: 2, label: '2-3 séances/semaine', desc: 'Idéal pour débutants ou emploi du temps chargé', emoji: '🌱' },
                                        { value: 4, label: '4 séances/semaine', desc: 'Standard, bon équilibre effort/récupération', emoji: '💪' },
                                        { value: 5, label: '5+ séances/semaine', desc: 'Pour les plus engagés', emoji: '🔥' },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.sessionsPerWeek === option.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                value={option.value}
                                                checked={formData.sessionsPerWeek === option.value}
                                                onChange={() => setValue('sessionsPerWeek', option.value)}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl">{option.emoji}</span>
                                            <div className="flex-1">
                                                <p className="font-semibold">{option.label}</p>
                                                <p className="text-sm text-muted-foreground">{option.desc}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.sessionsPerWeek === option.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                                                }`}>
                                                {formData.sessionsPerWeek === option.value && (
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Step 5: Reference Time */}
                            {step === 4 && (
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
                                        />
                                        <p className="text-xs text-muted-foreground text-right">
                                            {formData.referenceTime?.length || 0}/100 caractères
                                        </p>
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
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                        💡 Un temps récent (moins de 3 mois) aide l&apos;IA à calculer tes allures optimales.
                                    </p>
                                </div>
                            )}

                            {/* Step 6: Injuries */}
                            {step === 5 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="injuries">Blessures ou précautions (optionnel)</Label>
                                        <Textarea
                                            id="injuries"
                                            placeholder="Ex: Douleur genou droit si je cours trop longtemps"
                                            {...register('injuriesNotes')}
                                            rows={4}
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-muted-foreground text-right">
                                            {formData.injuriesNotes?.length || 0}/500 caractères
                                        </p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                                        ⚠️ <strong>Important :</strong> Consulte un médecin si tu as des blessures sérieuses avant de commencer un programme d&apos;entraînement.
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 mt-8">
                                {step > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={goBack}
                                        className="flex-1"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Retour
                                    </Button>
                                )}
                                {step < questions.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={goNext}
                                        className="flex-1"
                                    >
                                        Suivant
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-primary hover:bg-primary/90"
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        Générer Mon Programme
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <footer className="p-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} RunCoach.AI
            </footer>
        </div>
    )
}
