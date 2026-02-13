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
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b-2 border-foreground/10">
                <div className="container mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-12 w-auto" />
                    <nav className="flex items-center gap-4 sm:gap-8">
                        <Link href="/login" className="hidden sm:block text-slate hover:text-foreground transition-colors font-medium text-sm">
                            Connexion
                        </Link>
                        <Link href="/onboarding">
                            <Button size="sm" className="rounded-lg bg-forest text-white font-semibold px-5 sm:px-6 hover:bg-forest-dim border-2 border-forest" style={{ boxShadow: '2px 2px 0px #1A1A1A' }}>
                                Commencer
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <Hero />
            <ProblemSection />
            <SolutionSection />

            {/* Dark Footer */}
            <footer className="bg-foreground text-background py-12 px-6">
                <div className="container mx-auto max-w-5xl flex flex-col items-center gap-4">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto invert" />
                    <p className="text-background/60 text-sm text-center">
                        Coach IA running &mdash; M&eacute;thodologie Jack Daniels
                    </p>
                    <div className="flex items-center gap-6 text-xs text-background/40">
                        <Link href="/terms" className="hover:text-background/80 transition-colors">CGU</Link>
                        <Link href="/privacy" className="hover:text-background/80 transition-colors">Confidentialit&eacute;</Link>
                    </div>
                    <p className="text-xs text-background/30">&copy; {new Date().getFullYear()} Joggeur</p>
                </div>
            </footer>
        </div>
    )
}
