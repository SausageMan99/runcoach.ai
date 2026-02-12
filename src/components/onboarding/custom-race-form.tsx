'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

interface CustomRaceData {
    id: string
    name: string
    city: string
    date: string
    distance_km: number
    elevation_gain_m: number
    elevation_loss_m: number
    terrain_type: 'route' | 'trail' | 'mixte'
    difficulty: 'facile' | 'moyen' | 'difficile' | 'expert'
    country: string
    key_points: string[]
    typical_weather: string | null
    website_url: string | null
    custom: boolean
}

interface CustomRaceFormProps {
    initialName: string
    onSubmit: (race: CustomRaceData) => void
    onCancel: () => void
}

export default function CustomRaceForm({ initialName, onSubmit, onCancel }: CustomRaceFormProps) {
    const [name, setName] = useState(initialName)
    const [city, setCity] = useState('')
    const [date, setDate] = useState('')
    const [distanceKm, setDistanceKm] = useState('')
    const [elevationGain, setElevationGain] = useState('')
    const [terrainType, setTerrainType] = useState<'route' | 'trail' | 'mixte'>('route')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const race: CustomRaceData = {
            id: `custom-${Date.now()}`,
            name,
            city,
            date,
            distance_km: parseFloat(distanceKm),
            elevation_gain_m: elevationGain ? parseInt(elevationGain) : 0,
            elevation_loss_m: elevationGain ? parseInt(elevationGain) : 0,
            terrain_type: terrainType,
            difficulty: 'moyen',
            country: 'France',
            key_points: [],
            typical_weather: null,
            website_url: null,
            custom: true,
        }

        onSubmit(race)
    }

    return (
        <div className="p-5 bg-card rounded-2xl border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Ajouter ma course</h4>
                <button type="button" onClick={onCancel} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label className="text-sm">Nom de la course *</Label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Marathon de Saumur"
                        className="mt-1 rounded-xl"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm">Ville</Label>
                        <Input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Ex: Saumur"
                            className="mt-1 rounded-xl"
                        />
                    </div>
                    <div>
                        <Label className="text-sm">Date *</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-1 rounded-xl"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm">Distance (km) *</Label>
                        <Input
                            type="number"
                            step="0.1"
                            value={distanceKm}
                            onChange={(e) => setDistanceKm(e.target.value)}
                            placeholder="42.195"
                            className="mt-1 rounded-xl"
                            required
                        />
                    </div>
                    <div>
                        <Label className="text-sm">D&eacute;nivel&eacute;+ (m)</Label>
                        <Input
                            type="number"
                            value={elevationGain}
                            onChange={(e) => setElevationGain(e.target.value)}
                            placeholder="150"
                            className="mt-1 rounded-xl"
                        />
                    </div>
                </div>

                <div>
                    <Label className="text-sm">Type de terrain *</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        {([
                            { value: 'route' as const, label: 'Route', icon: '🛣️' },
                            { value: 'trail' as const, label: 'Trail', icon: '⛰️' },
                            { value: 'mixte' as const, label: 'Mixte', icon: '🏞️' },
                        ]).map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setTerrainType(type.value)}
                                className={`p-3 rounded-xl border-2 transition-all text-center ${
                                    terrainType === type.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border/50 hover:border-primary/30'
                                }`}
                            >
                                <div className="text-lg">{type.icon}</div>
                                <div className="text-xs font-medium mt-1">{type.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full rounded-xl py-5 bg-primary text-primary-foreground font-semibold"
                >
                    Utiliser cette course
                </Button>
            </form>
        </div>
    )
}
