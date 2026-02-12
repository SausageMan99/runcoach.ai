'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardError({
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex items-center justify-center p-6 min-h-[60vh]">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-2xl border border-border/50 shadow-sm">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                    <span className="text-3xl">😵</span>
                </div>
                <div className="space-y-2">
                    <h1 className="font-serif text-2xl">Erreur de chargement</h1>
                    <p className="text-muted-foreground text-sm">
                        Impossible de charger cette page. Réessaie dans quelques instants.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="rounded-2xl bg-primary text-primary-foreground font-semibold"
                    >
                        Réessayer
                    </Button>
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full rounded-2xl border-border/50">
                            Retour au dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
