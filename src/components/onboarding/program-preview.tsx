'use client'

import { Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { ProgramData } from '@/types'

interface ProgramPreviewProps {
    program: ProgramData
    onSignup: () => void
}

export default function ProgramPreview({ program, onSignup }: ProgramPreviewProps) {
    const previewWeeks = program.weeks.slice(0, 2)
    const lockedWeeksCount = program.weeks.length - 2

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            {/* Success message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
            >
                <div className="text-5xl">🎉</div>
                <h1 className="font-serif text-3xl sm:text-4xl">Ton programme est pr&ecirc;t !</h1>
                <p className="text-muted-foreground text-lg">
                    Aper&ccedil;u des 2 premi&egrave;res semaines
                </p>
            </motion.div>

            {/* Summary */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3"
            >
                <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
                    <p className="font-serif text-2xl text-primary">{program.weeks.length}</p>
                    <p className="text-xs text-muted-foreground">semaines</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
                    <p className="font-serif text-2xl text-primary">{program.user_profile.sessions_per_week}</p>
                    <p className="text-xs text-muted-foreground">s&eacute;ances/sem</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
                    <p className="font-serif text-2xl text-primary">{program.program_summary.peak_week_volume_km || '—'}</p>
                    <p className="text-xs text-muted-foreground">km pic</p>
                </div>
            </motion.div>

            {/* Preview weeks */}
            <div className="space-y-4">
                {previewWeeks.map((week, weekIdx) => (
                    <motion.div
                        key={week.week_number}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + weekIdx * 0.1 }}
                        className="rounded-2xl bg-card border border-border/50 overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">Semaine {week.week_number}</h3>
                                <p className="text-sm text-muted-foreground">{week.focus}</p>
                            </div>
                            <span className="text-sm text-muted-foreground">{week.total_volume_km} km</span>
                        </div>
                        <div className="divide-y divide-border/30">
                            {week.sessions.filter(s => !s.rest_day).map((session, idx) => (
                                <div key={idx} className="px-5 py-3 flex items-center justify-between">
                                    <div>
                                        <span className="font-medium text-sm">{session.day}</span>
                                        <span className="text-muted-foreground text-sm ml-2">{session.session_type}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {session.distance_km && `${session.distance_km}km`}
                                        {session.distance_km && session.duration_min && ' · '}
                                        {session.duration_min && `${session.duration_min}min`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Locked content */}
            {lockedWeeksCount > 0 && (
                <div className="relative">
                    {/* Blurred preview */}
                    <div className="blur-sm opacity-40 pointer-events-none space-y-4">
                        {program.weeks.slice(2, 4).map((week) => (
                            <div key={week.week_number} className="rounded-2xl bg-card border border-border/50 p-5">
                                <h3 className="font-semibold">Semaine {week.week_number}</h3>
                                <div className="h-20" />
                            </div>
                        ))}
                    </div>

                    {/* Unlock overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-card rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-primary/30 max-w-sm w-full text-center"
                        >
                            <Lock className="w-10 h-10 mx-auto mb-4 text-primary" />
                            <h3 className="font-serif text-xl sm:text-2xl mb-2">
                                D&eacute;bloque ton programme complet
                            </h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                {lockedWeeksCount} semaine{lockedWeeksCount > 1 ? 's' : ''} restante{lockedWeeksCount > 1 ? 's' : ''} + tracking + adaptation
                            </p>
                            <Button
                                onClick={onSignup}
                                size="lg"
                                className="w-full rounded-2xl py-6 bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25"
                            >
                                Cr&eacute;er mon compte (gratuit)
                            </Button>
                            <p className="mt-3 text-xs text-muted-foreground">
                                30 secondes · Aucune carte bancaire
                            </p>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    )
}
