'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { MapPin, Mountain, Calendar } from 'lucide-react'
import type { Race } from '@/types'

interface RaceAutocompleteProps {
    onSelect: (race: Race) => void
    onClear: () => void
    selectedRace: Race | null
}

export default function RaceAutocomplete({ onSelect, onClear, selectedRace }: RaceAutocompleteProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Race[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleQueryChange = (newQuery: string) => {
        setQuery(newQuery)

        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (newQuery.length < 2) {
            setResults([])
            setIsOpen(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            const supabase = createClient()
            const today = new Date().toISOString().split('T')[0]

            const { data } = await supabase
                .from('races')
                .select('*')
                .ilike('name', `%${newQuery}%`)
                .gte('date', today)
                .order('date', { ascending: true })
                .limit(5)

            setResults((data as Race[]) || [])
            setIsOpen(true)
            setLoading(false)
        }, 300)
    }

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    if (selectedRace) {
        return (
            <div className="p-4 rounded-2xl border-2 border-primary/30 bg-primary/5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="font-semibold text-lg">{selectedRace.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{selectedRace.city}</span>
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(selectedRace.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{selectedRace.distance_km} km</span>
                            {selectedRace.terrain_type === 'trail' && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <Mountain className="w-3 h-3" />
                                    D+ {selectedRace.elevation_gain_m}m
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                        Changer
                    </button>
                </div>
            </div>
        )
    }

    const terrainLabel = (type: string) => {
        switch (type) {
            case 'trail': return 'Trail'
            case 'mixte': return 'Mixte'
            default: return 'Route'
        }
    }

    return (
        <div ref={containerRef} className="relative">
            <Input
                placeholder="Rechercher une course (ex: Marathon de Paris)..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-full rounded-xl py-5"
            />
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border/50 rounded-2xl shadow-lg overflow-hidden">
                    {results.map((race) => (
                        <button
                            key={race.id}
                            type="button"
                            onClick={() => {
                                onSelect(race)
                                handleQueryChange('')
                            }}
                            className="w-full text-left p-4 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {terrainLabel(race.terrain_type).charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{race.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {race.city} • {race.distance_km} km •{' '}
                                        {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {isOpen && results.length === 0 && query.length >= 2 && !loading && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border/50 rounded-2xl shadow-lg p-4 text-center text-sm text-muted-foreground">
                    Aucune course trouvée
                </div>
            )}
        </div>
    )
}
