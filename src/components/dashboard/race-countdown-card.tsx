'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Calendar, Mountain } from 'lucide-react'
import type { Race } from '@/types'

interface RaceCountdownCardProps {
    race: Race
}

export default function RaceCountdownCard({ race }: RaceCountdownCardProps) {
    const raceDate = new Date(race.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysRemaining = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return (
        <Card className="overflow-hidden border-primary/20">
            <div className="gradient-accent p-6 text-white">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium opacity-80">Objectif course</p>
                        <p className="font-serif text-xl">{race.name}</p>
                        <div className="flex items-center gap-3 text-sm opacity-80">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {race.city}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {raceDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-serif text-4xl font-bold">{daysRemaining > 0 ? `J-${daysRemaining}` : 'Jour J !'}</p>
                    </div>
                </div>
            </div>
            <CardContent className="pt-4">
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold">{race.distance_km} km</span>
                    <span className="text-muted-foreground">
                        {race.terrain_type === 'trail' ? 'Trail' : race.terrain_type === 'mixte' ? 'Mixte' : 'Route'}
                    </span>
                    {race.elevation_gain_m > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Mountain className="w-3 h-3" />
                            D+ {race.elevation_gain_m}m
                        </span>
                    )}
                    {race.typical_weather && (
                        <span className="text-muted-foreground">{race.typical_weather}</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
