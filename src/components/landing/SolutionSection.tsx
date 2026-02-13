'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
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

const steps = [
    {
        number: '01',
        title: 'R\u00e9ponds \u00e0 7 questions',
        desc: 'Niveau, objectif, dispo, blessures\u2026 En 2 minutes c\'est pli\u00e9.',
    },
    {
        number: '02',
        title: 'L\'IA g\u00e9n\u00e8re ton plan',
        desc: 'Bas\u00e9 sur la m\u00e9thode Jack Daniels (VDOT). Allures, volume, progression\u2009: tout est calcul\u00e9.',
    },
    {
        number: '03',
        title: 'Il s\'adapte chaque semaine',
        desc: 'Fatigu\u00e9 ? Intensit\u00e9 r\u00e9duite. Malade ? Repos auto. Ta vie change, ton plan suit.',
    },
]

const stats = [
    { value: '85/15', label: 'ratio easy/hard' },
    { value: '3', label: 's\u00e9ances/semaine min.' },
    { value: '0\u20ac', label: 'pour commencer' },
]

export default function SolutionSection() {
    return (
        <section className="py-20 sm:py-28 px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-16">
                    {/* Methodology stats */}
                    <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center card-brutal p-6">
                                <p className="font-serif text-4xl sm:text-5xl font-bold text-forest">{stat.value}</p>
                                <p className="text-sm text-slate mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>

                    <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl leading-snug">
                        Comment \u00e7a marche
                    </motion.h2>

                    {/* Vertical timeline */}
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-forest/20 hidden md:block" />
                        <div className="space-y-8">
                            {steps.map((item, i) => (
                                <motion.div
                                    key={item.number}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="flex gap-6 items-start"
                                >
                                    <div className="w-12 h-12 shrink-0 rounded-full bg-forest text-white flex items-center justify-center font-mono text-sm font-bold border-2 border-forest" style={{ boxShadow: '3px 3px 0px #1A1A1A' }}>
                                        {item.number}
                                    </div>
                                    <div className="card-brutal p-6 flex-1">
                                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                        <p className="text-slate">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <motion.div variants={fadeUp} className="text-center pt-4">
                        <Link href="/onboarding">
                            <Button
                                size="lg"
                                className="rounded-lg bg-forest text-white font-semibold text-lg px-8 sm:px-10 py-6 sm:py-7 hover:bg-forest-dim transition-all border-2 border-forest"
                                style={{ boxShadow: '4px 4px 0px #1A1A1A' }}
                            >
                                Cr\u00e9er mon programme gratuit
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <p className="text-sm text-grey mt-3">
                            2 min &bull; Gratuit &bull; Aucune CB
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
