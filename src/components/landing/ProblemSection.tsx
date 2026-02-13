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
        title: 'Plans rigides',
        text: '3x1000m pr\u00e9vu. Semaine de fou au boulot. Tu rates, tu culpabilises, tu l\u00e2ches.',
    },
    {
        emoji: '🤒',
        title: 'Z\u00e9ro adaptation',
        text: 'Rhume, fatigue, douleur. Le plan continue comme si de rien. Toi tu d\u00e9croches.',
    },
    {
        emoji: '💸',
        title: 'Coachs inaccessibles',
        text: '200\u20ac/mois pour un suivi perso. Sinon c\'est un plan Excel g\u00e9n\u00e9rique. Pas de milieu.',
    },
]

export default function ProblemSection() {
    return (
        <section className="py-20 sm:py-28 px-6 bg-secondary">
            <div className="container mx-auto max-w-5xl">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-12">
                    <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl leading-snug">
                        Pourquoi 80% des coureurs abandonnent
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {problems.map((item) => (
                            <motion.div key={item.title} variants={fadeUp} className="card-brutal p-6 sm:p-8">
                                <div className="w-16 h-16 aspect-square bg-cream rounded-xl flex items-center justify-center text-3xl mb-5 border-2 border-foreground/10">
                                    {item.emoji}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-slate leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
