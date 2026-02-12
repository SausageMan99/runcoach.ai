'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { customRaceSchema, type CustomRaceFormData } from '@/lib/validations/schemas'

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
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CustomRaceFormData>({
        resolver: zodResolver(customRaceSchema),
        defaultValues: {
            name: initialName,
            city: '',
            date: '',
            distanceKm: '',
            elevationGain: '',
            terrainType: 'route',
        },
    })

    const terrainType = watch('terrainType')

    const onFormSubmit = (data: CustomRaceFormData) => {
        const race: CustomRaceData = {
            id: `custom-${Date.now()}`,
            name: data.name,
            city: data.city || '',
            date: data.date,
            distance_km: parseFloat(data.distanceKm),
            elevation_gain_m: data.elevationGain ? parseInt(data.elevationGain) : 0,
            elevation_loss_m: data.elevationGain ? parseInt(data.elevationGain) : 0,
            terrain_type: data.terrainType,
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

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <div>
                    <Label className="text-sm">Nom de la course *</Label>
                    <Input
                        type="text"
                        {...register('name')}
                        placeholder="Ex: Marathon de Saumur"
                        className="mt-1 rounded-xl"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm">Ville</Label>
                        <Input
                            type="text"
                            {...register('city')}
                            placeholder="Ex: Saumur"
                            className="mt-1 rounded-xl"
                        />
                    </div>
                    <div>
                        <Label className="text-sm">Date *</Label>
                        <Input
                            type="date"
                            {...register('date')}
                            min={new Date().toISOString().split('T')[0]}
                            className="mt-1 rounded-xl"
                        />
                        {errors.date && <p className="text-xs text-destructive mt-1">{errors.date.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-sm">Distance (km) *</Label>
                        <Input
                            type="number"
                            step="0.1"
                            {...register('distanceKm')}
                            placeholder="42.195"
                            className="mt-1 rounded-xl"
                        />
                        {errors.distanceKm && <p className="text-xs text-destructive mt-1">{errors.distanceKm.message}</p>}
                    </div>
                    <div>
                        <Label className="text-sm">D&eacute;nivel&eacute;+ (m)</Label>
                        <Input
                            type="number"
                            {...register('elevationGain')}
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
                                onClick={() => setValue('terrainType', type.value)}
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
