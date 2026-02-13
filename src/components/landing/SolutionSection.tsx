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
        number: 1,
        title: 'Tu réponds à 3 questions',
        desc: 'Objectif, niveau, disponibilité',
    },
    {
        number: 2,
        title: 'L\'IA génère ton plan perso',
        desc: 'Basé sur méthode Jack Daniels',
    },
    {
        number: 3,
        title: 'Chaque semaine, il s\'adapte',
        desc: '→ Fatigué ? Intensité réduite\n→ Malade ? Repos auto\n→ Météo pourrie ? Plan B proposé',
    },
]

export default function SolutionSection() {
    return (
        <section className="py-20 sm:py-28 px-6 relative overflow-hidden">
            <div className="blob-bg w-72 sm:w-[400px] h-72 sm:h-[400px] bg-terracotta-light/20 top-[10%] right-[10%]" />
            <div className="container mx-auto max-w-5xl relative z-10">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-12">
                    <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl leading-snug">
                        Un programme qui vit
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        {steps.map((item, i) => (
                            <motion.div
                                key={item.number}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                                className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-terracotta text-white flex items-center justify-center mb-6 font-serif text-xl font-bold">
                                    {item.number}
                                </div>
                                <h3 className="font-semibold text-lg sm:text-xl mb-2">{item.title}</h3>
                                <p className="text-muted-foreground whitespace-pre-line">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA répété */}
                    <motion.div variants={fadeUp} className="text-center pt-4">
                        <Link href="/onboarding">
                            <Button
                                size="lg"
                                className="rounded-lg bg-terracotta text-white font-semibold text-lg px-8 sm:px-10 py-6 sm:py-7 hover:bg-terracotta-dark transition-all"
                                style={{ boxShadow: '6px 6px 0px rgba(232, 119, 34, 0.3)' }}
                            >
                                Cr&eacute;er mon programme gratuit
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <p className="text-sm text-grey mt-3">
                            3 min &bull; Gratuit &bull; Aucune CB
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
