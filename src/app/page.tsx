'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Hero from '@/components/landing/Hero'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-12 w-auto" />
                    <nav className="flex items-center gap-4 sm:gap-8">
                        <Link href="/login" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                            Connexion
                        </Link>
                        <Link href="/onboarding">
                            <Button size="sm" className="rounded-lg bg-terracotta text-white font-semibold px-5 sm:px-6 hover:bg-terracotta-dark">
                                Commencer
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <Hero />
            <ProblemSection />
            <SolutionSection />

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-border/50">
                <div className="container mx-auto flex flex-col items-center gap-3 text-sm text-muted-foreground">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    <p>Fait pour les coureurs du dimanche</p>
                </div>
            </footer>
        </div>
    )
}
