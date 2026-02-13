'use client'

import { motion } from 'framer-motion'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
}

const stagger = {
    visible: {
        transition: { staggerChildren: 0.15 },
    },
}

const problems = [
    {
        emoji: '😫',
        title: 'Semaine de fou au boulot',
        text: 'Le plan dit 3x1000m. Ton corps dit canapé.\n→ Échec. Culpabilité. Abandon.',
    },
    {
        emoji: '🤒',
        title: 'Rhume de 3 jours',
        text: 'Le plan continue comme si de rien.\nTu décroches. C\'est mort.',
    },
    {
        emoji: '🌧️',
        title: 'Météo de merde',
        text: '12km prévu. Il pleut des cordes.\nLe plan s\'en fout. Toi non.',
    },
]

export default function ProblemSection() {
    return (
        <section className="py-20 sm:py-28 px-6 bg-secondary">
            <div className="container mx-auto max-w-5xl">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-12">
                    <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl leading-snug">
                        Pourquoi tu abandonnes toujours
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {problems.map((item) => (
                            <motion.div key={item.title} variants={fadeUp} className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 shadow-sm">
                                <div className="text-4xl mb-4">{item.emoji}</div>
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                    <motion.p variants={fadeUp} className="font-bold text-lg">
                        Le probl&egrave;me : les plans sont rigides. Ta vie ne l&apos;est pas.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    )
}
