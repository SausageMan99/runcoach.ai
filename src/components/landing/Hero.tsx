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
        <section className="pt-28 sm:pt-36 pb-20 sm:pb-28 px-6 min-h-[85vh] flex items-center relative overflow-hidden">
            <div className="blob-bg w-72 sm:w-[500px] h-72 sm:h-[500px] bg-terracotta/15 -top-20 right-[5%]" />
            <div className="blob-bg w-56 sm:w-[300px] h-56 sm:h-[300px] bg-terracotta-light/30 bottom-10 left-[5%]" style={{ animationDelay: '4s' }} />
            <div className="relative z-10 container mx-auto max-w-5xl">
                <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl space-y-8">
                    <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                        <span className="text-8xl" role="img" aria-label="Coureur">🏃</span>
                    </motion.div>
                    <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }} className="font-serif text-5xl md:text-6xl leading-[1.05]">
                        Ton plan d&apos;entra&icirc;nement s&apos;adapte &agrave; tes{' '}
                        <span className="text-terracotta">semaines de merde</span>
                    </motion.h1>
                    <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-grey max-w-xl leading-relaxed">
                        Pas de coach priv&eacute; &agrave; 200&euro;/mois. Pas de plan Excel oubli&eacute;.
                        <br />
                        Juste un programme qui &eacute;volue avec ta vie.
                    </motion.p>
                    <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }}>
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
                    </motion.div>
                    <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.5 }} className="text-sm text-grey">
                        3 min &bull; Gratuit &bull; Aucune CB
                    </motion.p>
                </motion.div>
            </div>
        </section>
    )
}
