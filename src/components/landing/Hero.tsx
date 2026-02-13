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

export default function Hero() {
    return (
        <section className="pt-28 sm:pt-36 pb-20 sm:pb-28 px-6 min-h-[85vh] flex items-center relative overflow-hidden topo-pattern">
            <div className="relative z-10 container mx-auto max-w-5xl">
                <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl space-y-8">
                    <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                        <span className="inline-block px-4 py-2 text-sm font-semibold border-2 border-foreground rounded-full">
                            Coach IA running
                        </span>
                    </motion.div>
                    <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }} className="font-serif text-5xl md:text-7xl leading-[1.05]">
                        Ton plan running{' '}
                        <span className="text-forest">s&apos;adapte &agrave; ta vraie vie</span>
                    </motion.h1>
                    <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-slate max-w-xl leading-relaxed">
                        Un programme g&eacute;n&eacute;r&eacute; par IA bas&eacute; sur la m&eacute;thodologie Jack Daniels.
                        <br />
                        Il &eacute;volue chaque semaine selon ta forme et ta dispo.
                    </motion.p>
                    <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }} className="flex items-center gap-4">
                        <Link href="/onboarding">
                            <Button
                                size="lg"
                                className="rounded-lg bg-forest text-white font-semibold text-lg px-8 sm:px-10 py-6 sm:py-7 hover:bg-forest-dim transition-all border-2 border-forest"
                                style={{ boxShadow: '4px 4px 0px #1A1A1A' }}
                            >
                                Cr&eacute;er mon programme
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>
                    <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.5 }} className="text-sm text-grey">
                        2 min &bull; Gratuit &bull; Aucune CB
                    </motion.p>
                </motion.div>
            </div>
        </section>
    )
}
