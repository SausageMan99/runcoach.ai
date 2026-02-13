'use client'

import { OBJECTIVE_STATS } from '@/lib/constants/onboarding-stats'

interface ObjectiveOption {
    value: string
    label: string
    icon: string
}

const objectives: ObjectiveOption[] = [
    { value: '10k', label: '10 km', icon: '🏃' },
    { value: 'semi', label: 'Semi-marathon', icon: '🏃\u200D♂️' },
    { value: 'marathon', label: 'Marathon', icon: '🏃\u200D♀️' },
    { value: 'improve', label: 'Progresser', icon: '🎯' },
]

interface ObjectiveSelectorProps {
    selected: string | null
    onSelect: (value: string) => void
}

export default function ObjectiveSelector({ selected, onSelect }: ObjectiveSelectorProps) {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-snug">
                    Quel est ton objectif ?
                </h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {objectives.map((obj) => (
                    <button
                        key={obj.value}
                        type="button"
                        onClick={() => onSelect(obj.value)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-center space-y-2 ${
                            selected === obj.value
                                ? 'border-forest bg-forest-light/30 shadow-md'
                                : 'border-border/50 bg-card hover:border-forest/30 hover:shadow-sm'
                        }`}
                        aria-pressed={selected === obj.value}
                    >
                        <div className="text-4xl">{obj.icon}</div>
                        <p className="font-semibold text-sm">{obj.label}</p>
                        <p className="text-xs text-grey">{OBJECTIVE_STATS[obj.value]}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}
