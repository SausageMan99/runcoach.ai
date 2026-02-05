'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const loadingTips = [
    "🧠 Analyse de ton profil running...",
    "📊 Calcul de tes allures optimales...",
    "📈 Construction du plan de progression...",
    "🗓️ Répartition des séances par semaine...",
    "💪 Intégration des phases de récupération...",
    "✨ Presque prêt...",
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
                // Get onboarding data from localStorage
                const storageKey = 'runcoach_onboarding'
                const savedData = localStorage.getItem(storageKey)

                if (!savedData) {
                    setError('Données de profil manquantes. Recommence le questionnaire.')
                    setStatus('error')
                    return
                }

                const onboardingData = JSON.parse(savedData)

                // Call API
                const response = await fetch('/api/generate-program', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(onboardingData),
                })

                const result = await response.json()

                if (!response.ok) {
                    setError(result.error || 'Erreur lors de la génération')
                    setStatus('error')
                    return
                }

                // Success!
                setProgramId(result.programId)
                setStatus('success')

                // Clear onboarding data
                localStorage.removeItem(storageKey)

                // Redirect after short delay
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
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
            {/* Header */}
            <header className="p-4">
                <Link href="/" className="flex items-center gap-2 w-fit">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">RC</span>
                    </div>
                    <span className="font-bold text-xl">RunCoach<span className="text-primary">.AI</span></span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-border/50">
                    <CardContent className="pt-8 pb-8 text-center">
                        {status === 'loading' && (
                            <div className="space-y-6">
                                {/* Animated Runner */}
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                                    <div className="absolute inset-2 bg-primary/20 rounded-full animate-pulse" />
                                    <div className="absolute inset-4 bg-primary/30 rounded-full flex items-center justify-center">
                                        <span className="text-4xl">🏃</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold">
                                        Génération en cours...
                                    </h2>
                                    <p className="text-muted-foreground transition-all duration-500">
                                        {loadingTips[currentTip]}
                                    </p>
                                </div>

                                <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />

                                <p className="text-sm text-muted-foreground">
                                    Cela peut prendre jusqu&apos;à 30 secondes
                                </p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-green-600">
                                        Programme créé ! 🎉
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Ton plan personnalisé est prêt. Redirection...
                                    </p>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-10 h-10 text-red-600" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-red-600">
                                        Oups ! 😕
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {error}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => window.location.reload()}
                                        className="w-full"
                                    >
                                        Réessayer
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/onboarding')}
                                        className="w-full"
                                    >
                                        Recommencer le questionnaire
                                    </Button>
                                </div>
                            </div>
                        )}
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
