'use client'

import { useState, useEffect } from 'react'

export function BetaBadge() {
    const [testerCount, setTesterCount] = useState<number | null>(null)

    useEffect(() => {
        fetch('/api/stats/testers')
            .then(r => r.json())
            .then(data => setTesterCount(data.count))
            .catch(() => setTesterCount(null))
    }, [])

    return (
        <div className="inline-flex flex-wrap items-center gap-3 px-5 py-2.5 rounded-full bg-accent-warm/10 border border-accent-warm/30">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-warm animate-pulse" />
                <span className="font-semibold text-sm text-foreground">Prototype en test</span>
            </div>

            {testerCount !== null && testerCount > 0 && (
                <span className="text-sm text-muted-foreground">
                    {testerCount} testeur{testerCount > 1 ? 's' : ''} actif{testerCount > 1 ? 's' : ''}
                </span>
            )}

            <span className="text-sm text-muted-foreground">
                100% gratuit pendant la b&ecirc;ta
            </span>
        </div>
    )
}
