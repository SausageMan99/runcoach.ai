'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import type { CheckInResult } from '@/types'

interface DailyCheckInCardProps {
    nextSessionWeek: number
    nextSessionDay: string
    hasCheckedInToday: boolean
}

const feelings = [
    { value: 1, label: 'En forme', icon: '💪', bg: 'bg-forest/10 hover:bg-forest/20 border-forest/30', activeBg: 'bg-forest/20 border-forest/50' },
    { value: 2, label: 'Fatigué', icon: '😴', bg: 'bg-warning/10 hover:bg-warning/20 border-warning/30', activeBg: 'bg-warning/20 border-warning/50' },
    { value: 3, label: 'Très fatigué', icon: '🤕', bg: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/30', activeBg: 'bg-destructive/20 border-destructive/50' },
]

export default function DailyCheckInCard({
    nextSessionWeek,
    nextSessionDay,
    hasCheckedInToday,
}: DailyCheckInCardProps) {
    const [result, setResult] = useState<CheckInResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(hasCheckedInToday)

    const handleCheckIn = async (feeling: number) => {
        setLoading(true)
        try {
            const res = await fetch('/api/daily-check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feeling,
                    sessionWeek: nextSessionWeek,
                    sessionDay: nextSessionDay,
                }),
            })
            if (!res.ok) {
                toast.error('Impossible de sauvegarder le check-in')
                return
            }
            const data = await res.json()
            setResult(data)
            setDone(true)
        } catch {
            toast.error('Impossible de sauvegarder le check-in')
        } finally {
            setLoading(false)
        }
    }

    if (done && !result) {
        return (
            <Card className="border-forest/20 bg-forest/5">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-forest" />
                        </div>
                        <p className="font-medium text-forest">Check-in du jour effectué !</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (result) {
        const isRest = result.adjustment?.intensity_reduction === 100
        const isAdjusted = result.adjustment && !isRest

        return (
            <Card className={`transition-all duration-300 ${
                isRest
                    ? 'border-destructive/20 bg-destructive/5'
                    : isAdjusted
                        ? 'border-warning/20 bg-warning/5'
                        : 'border-forest/20 bg-forest/5'
            }`}>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isRest ? 'bg-destructive/10' : isAdjusted ? 'bg-warning/10' : 'bg-forest/10'
                        }`}>
                            <span className="text-lg">{isRest ? '🛑' : isAdjusted ? '⚠️' : '✅'}</span>
                        </div>
                        <div>
                            <p className="font-semibold">{result.message}</p>
                            {isAdjusted && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {result.adjustment!.original_type} → {result.adjustment!.adjusted_type}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">Comment te sens-tu aujourd&apos;hui ?</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {feelings.map((f) => (
                        <button
                            key={f.value}
                            disabled={loading}
                            onClick={() => handleCheckIn(f.value)}
                            aria-label={f.label}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${f.bg} disabled:opacity-50`}
                        >
                            <span className="text-3xl">{f.icon}</span>
                            <span className="text-xs font-medium">{f.label}</span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
