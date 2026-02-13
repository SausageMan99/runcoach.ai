'use client'

import { motion } from 'framer-motion'
import type { PreviewProgram } from '@/lib/utils/preview-templates'

interface ProgramPreviewCardProps {
    preview: PreviewProgram
    onAccept: () => void
    onCustomize: () => void
}

export default function ProgramPreviewCard({ preview, onAccept, onCustomize }: ProgramPreviewCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="text-center space-y-3">
                <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-snug">
                    Voici ton programme {preview.objective}
                </h1>
            </div>

            <div className="max-w-md mx-auto">
                <div className="p-6 rounded-2xl bg-card border-2 border-border/50 shadow-sm space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="bg-forest-light/50 text-forest-dim font-medium px-3 py-1 rounded-full">
                            {preview.weeks} semaines
                        </span>
                        <span className="bg-forest-light/50 text-forest-dim font-medium px-3 py-1 rounded-full">
                            {preview.sessionsPerWeek} s&eacute;ances/sem
                        </span>
                    </div>
                    <p className="text-sm text-grey">Progression adaptative</p>

                    <div className="border-t border-border/50 pt-4">
                        <p className="font-semibold text-sm mb-3">Semaine type :</p>
                        <ul className="space-y-2">
                            {preview.sampleWeek.map((session, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-forest mt-0.5">&#9679;</span>
                                    {session}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <p className="text-sm italic text-grey text-center">
                &#128161; Ce plan peut &ecirc;tre affin&eacute; selon ton niveau et tes disponibilit&eacute;s
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <button
                    type="button"
                    onClick={onAccept}
                    className="flex-1 rounded-lg bg-forest text-white font-semibold py-4 px-6 hover:bg-forest-dim transition-colors"
                    style={{ boxShadow: '4px 4px 0px #1A1A1A' }}
                >
                    C&apos;est parfait, je le garde
                </button>
                <button
                    type="button"
                    onClick={onCustomize}
                    className="flex-1 rounded-lg border-2 border-border/50 bg-card font-semibold py-4 px-6 hover:border-forest/30 transition-colors"
                >
                    Personnaliser davantage
                </button>
            </div>
        </motion.div>
    )
}
