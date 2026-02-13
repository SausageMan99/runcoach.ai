'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface RefinementData {
    level: string
    sessionsPerWeek: number
    targetDate?: string
}

interface RefinementFormProps {
    onSubmit: (data: RefinementData) => void
}

export default function RefinementForm({ onSubmit }: RefinementFormProps) {
    const [level, setLevel] = useState('intermédiaire')
    const [sessionsPerWeek, setSessionsPerWeek] = useState(3)
    const [targetDate, setTargetDate] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            level,
            sessionsPerWeek,
            targetDate: targetDate || undefined,
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="text-center space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-snug">
                    3 questions pour perfectionner
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
                {/* Niveau */}
                <div className="space-y-2">
                    <Label htmlFor="level">Niveau actuel</Label>
                    <select
                        id="level"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full rounded-xl border-2 border-border/50 bg-card px-4 py-3 text-sm focus:outline-none focus:border-forest transition-colors"
                    >
                        <option value="débutant">D&eacute;butant (moins de 6 mois)</option>
                        <option value="intermédiaire">Interm&eacute;diaire (6-24 mois)</option>
                        <option value="avancé">Avanc&eacute; (2+ ans)</option>
                    </select>
                </div>

                {/* Disponibilités */}
                <div className="space-y-2">
                    <Label htmlFor="sessions">Disponibilit&eacute;s (s&eacute;ances/semaine)</Label>
                    <select
                        id="sessions"
                        value={sessionsPerWeek}
                        onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                        className="w-full rounded-xl border-2 border-border/50 bg-card px-4 py-3 text-sm focus:outline-none focus:border-forest transition-colors"
                    >
                        <option value={2}>2-3 s&eacute;ances/semaine</option>
                        <option value={4}>4 s&eacute;ances/semaine</option>
                        <option value={5}>5+ s&eacute;ances/semaine</option>
                    </select>
                </div>

                {/* Date objectif */}
                <div className="space-y-2">
                    <Label htmlFor="targetDate">Date objectif (optionnel)</Label>
                    <Input
                        id="targetDate"
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="rounded-xl"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-forest text-white font-semibold py-4 px-6 hover:bg-forest-dim transition-colors"
                    style={{ boxShadow: '4px 4px 0px #1A1A1A' }}
                >
                    G&eacute;n&eacute;rer mon plan final
                </button>
            </form>
        </motion.div>
    )
}
