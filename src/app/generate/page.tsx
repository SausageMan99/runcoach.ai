'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const loadingTips = [
    "Analyse de ton profil running...",
    "Calcul de tes allures optimales...",
    "Construction du plan de progression...",
    "Répartition des séances par semaine...",
    "Intégration des phases de récupération...",
    "Presque prêt...",
]

export default function GeneratePage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [error, setError] = useState<string | null>(null)
    const [currentTip, setCurrentTip] = useState(0)
    const [programId, setProgramId] = useState<string | null>(null)

    // Rotate loading tips
    useEffect(() => {
        if (status !== 'loading') return

        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % loadingTips.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [status])

    // Generate program on mount
    useEffect(() => {
        const generateProgram = async () => {
            try {
                const storageKey = 'runcoach_onboarding'
                const savedData = localStorage.getItem(storageKey)

                if (!savedData) {
                    setError('Données de profil manquantes. Recommence le questionnaire.')
                    setStatus('error')
                    return
                }

                const onboardingData = JSON.parse(savedData)

                const response = await fetch('/api/generate-program', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(onboardingData),
                })

                const result = await response.json()

                if (!response.ok) {
                    setError(result.error || 'Erreur lors de la génération')
                    setStatus('error')
                    return
                }

                setProgramId(result.programId)
                setStatus('success')
                localStorage.removeItem(storageKey)

                setTimeout(() => {
                    router.push('/dashboard?new=true')
                }, 2000)

            } catch (err) {
                console.error('Generation error:', err)
                setError('Une erreur est survenue. Réessaie.')
                setStatus('error')
            }
        }

        generateProgram()
    }, [router])

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            {/* Blob backgrounds */}
            <div className="blob-bg" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-warm/10 rounded-full blur-3xl" />

            {/* Header */}
            <header className="relative z-10 p-6">
                <Link href="/" className="flex items-center gap-1 w-fit">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-12 w-auto" />
                </Link>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center">
                    {status === 'loading' && (
                        <div className="space-y-8">
                            {/* Concentric pulsing circles */}
                            <div className="relative w-40 h-40 mx-auto">
                                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-[concentric-pulse_3s_ease-out_infinite]" />
                                <div className="absolute inset-4 rounded-full border-2 border-primary/30 animate-[concentric-pulse_3s_ease-out_0.5s_infinite]" />
                                <div className="absolute inset-8 rounded-full border-2 border-primary/40 animate-[concentric-pulse_3s_ease-out_1s_infinite]" />
                                <div className="absolute inset-12 rounded-full bg-primary/10 animate-pulse-soft flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta to-terracotta-dark flex items-center justify-center">
                                        <span className="text-3xl">🏃</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="font-serif text-3xl">
                                    Génération en cours
                                </h2>
                                <p className="text-muted-foreground transition-all duration-500 min-h-[1.5rem]">
                                    {loadingTips[currentTip]}
                                </p>
                            </div>

                            {/* Gradient progress bar */}
                            <div className="w-48 h-1.5 mx-auto rounded-full bg-muted overflow-hidden">
                                <div className="h-full w-1/2 rounded-full gradient-accent animate-[shimmer_1.5s_ease-in-out_infinite]" />
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Cela peut prendre jusqu&apos;à 30 secondes
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6 animate-scale-in">
                            <div className="w-24 h-24 bg-terracotta/10 rounded-3xl flex items-center justify-center mx-auto">
                                <CheckCircle className="w-12 h-12 text-terracotta" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="font-serif text-3xl text-terracotta">
                                    Programme créé !
                                </h2>
                                <p className="text-muted-foreground">
                                    Ton plan personnalisé est prêt. Redirection...
                                </p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6 animate-scale-in">
                            <div className="w-24 h-24 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto">
                                <AlertCircle className="w-12 h-12 text-destructive" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="font-serif text-3xl text-destructive">
                                    Oups !
                                </h2>
                                <p className="text-muted-foreground">
                                    {error}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="w-full rounded-2xl py-6 font-semibold"
                                >
                                    Réessayer
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/onboarding')}
                                    className="w-full rounded-2xl py-6 border-border/50"
                                >
                                    Recommencer le questionnaire
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 p-6 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Joggeur
            </footer>
        </div>
    )
}
