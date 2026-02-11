'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
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

const sections = [
    { id: 'hero' },
    { id: 'problem' },
    { id: 'solution' },
    { id: 'how' },
    { id: 'social' },
    { id: 'cta' },
]

export default function LandingPage() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [activeSection, setActiveSection] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Map vertical wheel to horizontal scroll (desktop only)
    useEffect(() => {
        if (isMobile) return
        const container = scrollRef.current
        if (!container) return

        let isScrolling = false
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            if (isScrolling) return

            const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
            if (Math.abs(delta) < 10) return

            isScrolling = true
            const direction = delta > 0 ? 1 : -1
            const newIndex = Math.max(0, Math.min(sections.length - 1, activeSection + direction))

            if (newIndex !== activeSection) {
                const target = container.children[newIndex] as HTMLElement
                target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
                setActiveSection(newIndex)
            }

            setTimeout(() => { isScrolling = false }, 800)
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, [isMobile, activeSection])

    const scrollToSection = useCallback((index: number) => {
        const container = scrollRef.current
        if (!container) return
        const target = container.children[index] as HTMLElement
        target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
        setActiveSection(index)
    }, [])

    // Detect active section from scroll position
    useEffect(() => {
        if (isMobile) return
        const container = scrollRef.current
        if (!container) return

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft
            const sectionWidth = container.offsetWidth
            const newActive = Math.round(scrollLeft / sectionWidth)
            setActiveSection(Math.max(0, Math.min(sections.length - 1, newActive)))
        }

        container.addEventListener('scroll', handleScroll, { passive: true })
        return () => container.removeEventListener('scroll', handleScroll)
    }, [isMobile])

    // Mobile: vertical layout
    if (isMobile) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                {/* Mobile Header */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <span className="font-serif text-2xl text-foreground">RunCoach</span>
                        <Link href="/onboarding">
                            <Button size="sm" className="rounded-2xl bg-primary text-primary-foreground font-semibold px-5">
                                Commencer
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <section className="pt-28 pb-16 px-6 min-h-[85vh] flex items-center relative overflow-hidden">
                    <div className="blob-bg w-72 h-72 bg-primary/20 -top-20 -right-20" />
                    <div className="blob-bg w-56 h-56 bg-accent-warm/20 bottom-10 -left-10" style={{ animationDelay: '4s' }} />
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-10 space-y-8">
                        <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }} className="font-serif text-5xl leading-[1.1] text-foreground">
                            Cours plus{' '}
                            <span className="gradient-accent-text">intelligemment.</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Un coach IA qui comprend ton corps, adapte ton programme en temps réel et te prépare à ta prochaine course.
                        </motion.p>
                        <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }}>
                            <Link href="/onboarding">
                                <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-semibold text-lg px-8 py-6 shadow-lg shadow-primary/25">
                                    Créer Mon Programme
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Problem */}
                <section className="py-20 px-6 bg-secondary">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-lg mx-auto space-y-6">
                        <motion.p variants={fadeUp} className="text-sm font-medium text-primary tracking-wide uppercase">Le problème</motion.p>
                        <motion.h2 variants={fadeUp} className="font-serif text-3xl leading-snug">
                            Tu cours seul, sans plan, sans savoir si tu progresses.
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed">
                            Plans génériques qui ne s&apos;adaptent pas. Risque de blessure. Motivation qui s&apos;essouffle. Tu mérites mieux.
                        </motion.p>
                    </motion.div>
                </section>

                {/* Solution */}
                <section className="py-20 px-6">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-lg mx-auto space-y-6">
                        <motion.p variants={fadeUp} className="text-sm font-medium text-primary tracking-wide uppercase">La solution</motion.p>
                        <motion.h2 variants={fadeUp} className="font-serif text-3xl leading-snug">
                            Un coach IA qui comprend <span className="gradient-accent-text">ton corps.</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed">
                            Programme adaptatif basé sur la méthodologie Jack Daniels VDOT. Check-in quotidien. Ajustement en temps réel. Prévention blessure intégrée.
                        </motion.p>
                    </motion.div>
                </section>

                {/* How it works */}
                <section className="py-20 px-6 bg-secondary">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="max-w-lg mx-auto space-y-10">
                        <motion.p variants={fadeUp} className="text-sm font-medium text-primary tracking-wide uppercase">Comment ça marche</motion.p>
                        <motion.h2 variants={fadeUp} className="font-serif text-3xl">3 minutes. Ton programme.</motion.h2>
                        {[
                            { step: '01', title: 'Réponds', desc: '7 questions sur ton niveau, objectif et disponibilités.' },
                            { step: '02', title: 'Reçois', desc: 'L\'IA génère un programme sur-mesure, adapté à ta course.' },
                            { step: '03', title: 'Progresse', desc: 'Check-in quotidien. Le programme évolue avec toi.' },
                        ].map((item) => (
                            <motion.div key={item.step} variants={fadeUp} className="flex gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary font-serif text-lg">{item.step}</span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Social proof */}
                <section className="py-20 px-6">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-lg mx-auto text-center space-y-8">
                        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
                            {[
                                { value: '500+', label: 'Runners' },
                                { value: '2K+', label: 'Programmes' },
                                { value: '98%', label: 'Satisfaits' },
                            ].map((stat) => (
                                <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border/50">
                                    <p className="font-serif text-2xl text-primary">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </motion.div>
                        <motion.blockquote variants={fadeUp} className="text-lg italic text-muted-foreground">
                            &ldquo;Depuis RunCoach, je ne cours plus au feeling. Chaque séance a un objectif. J&apos;ai battu mon record sur 10K.&rdquo;
                        </motion.blockquote>
                    </motion.div>
                </section>

                {/* CTA */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="blob-bg w-80 h-80 bg-primary/15 top-0 right-0" />
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="relative z-10 text-center space-y-6">
                        <motion.h2 variants={fadeUp} className="font-serif text-4xl">
                            Commence ton{' '}
                            <span className="gradient-accent-text">parcours.</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} className="text-muted-foreground">Gratuit. Sans engagement. Programme en 3 minutes.</motion.p>
                        <motion.div variants={fadeUp}>
                            <Link href="/onboarding">
                                <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-semibold text-lg px-10 py-6 shadow-lg shadow-primary/25">
                                    Créer Mon Programme
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Footer */}
                <footer className="py-8 px-6 border-t border-border/50">
                    <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-serif text-lg text-foreground">RunCoach</span>
                        <nav className="flex gap-6">
                            <Link href="/terms" className="hover:text-foreground transition-colors">CGU</Link>
                            <Link href="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link>
                        </nav>
                        <p>© {new Date().getFullYear()} RunCoach.AI</p>
                    </div>
                </footer>
            </div>
        )
    }

    // Desktop: horizontal scroll
    return (
        <div className="h-screen overflow-hidden bg-background text-foreground relative">
            {/* Fixed header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
                <div className="container mx-auto px-8 h-16 flex items-center justify-between">
                    <span className="font-serif text-2xl text-foreground">RunCoach</span>
                    <nav className="flex items-center gap-8">
                        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                            Connexion
                        </Link>
                        <Link href="/onboarding">
                            <Button className="rounded-2xl bg-primary text-primary-foreground font-semibold px-6">
                                Commencer
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Horizontal scroll container */}
            <div ref={scrollRef} className="horizontal-scroll h-screen pt-16">
                {/* Section 1: Hero */}
                <section className="min-w-[100vw] h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
                    <div className="blob-bg w-[500px] h-[500px] bg-primary/20 -top-40 right-[10%]" />
                    <div className="blob-bg w-[300px] h-[300px] bg-accent-warm/20 bottom-20 left-[5%]" style={{ animationDelay: '4s' }} />
                    <div className="relative z-10 container mx-auto px-16 max-w-6xl">
                        <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl space-y-8">
                            <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }} className="font-serif text-7xl lg:text-8xl leading-[1.05]">
                                Cours plus{' '}
                                <span className="gradient-accent-text">intelligemment.</span>
                            </motion.h1>
                            <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                                Un coach IA qui comprend ton corps, adapte ton programme en temps réel et te prépare à ta prochaine course.
                            </motion.p>
                            <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }}>
                                <Link href="/onboarding">
                                    <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-semibold text-lg px-10 py-7 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                        Créer Mon Programme
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 2: Le Problème */}
                <section className="min-w-[100vw] h-[calc(100vh-4rem)] flex items-center bg-secondary relative overflow-hidden">
                    <div className="container mx-auto px-16 max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="space-y-8"
                        >
                            <p className="text-sm font-medium text-primary tracking-widest uppercase">Le problème</p>
                            <h2 className="font-serif text-5xl lg:text-6xl leading-[1.15] max-w-3xl">
                                Tu cours seul, sans plan, sans savoir si tu progresses.
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                                Plans génériques. Risque de blessure. Motivation qui s&apos;essouffle. 80% des coureurs abandonnent leur programme en moins de 4 semaines.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Section 3: La Solution */}
                <section className="min-w-[100vw] h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
                    <div className="blob-bg w-[400px] h-[400px] bg-moss-light/15 top-[10%] right-[15%]" />
                    <div className="container mx-auto px-16 max-w-5xl relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="space-y-8"
                        >
                            <p className="text-sm font-medium text-primary tracking-widest uppercase">La solution</p>
                            <h2 className="font-serif text-5xl lg:text-6xl leading-[1.15] max-w-3xl">
                                Un coach IA qui comprend{' '}
                                <span className="gradient-accent-text">ton corps.</span>
                            </h2>
                            <div className="grid grid-cols-3 gap-6 pt-4 max-w-3xl">
                                {[
                                    { title: 'Adaptatif', desc: 'Check-in quotidien. Le programme s\'adapte à ta fatigue.' },
                                    { title: 'Spécifique', desc: 'Terrain, dénivelé, météo intégrés à ton plan.' },
                                    { title: 'Préventif', desc: 'Score de risque blessure en temps réel.' },
                                ].map((item) => (
                                    <div key={item.title} className="p-6 rounded-3xl bg-card border border-border/50 shadow-sm">
                                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 4: Comment ça marche */}
                <section className="min-w-[100vw] h-[calc(100vh-4rem)] flex items-center bg-secondary">
                    <div className="container mx-auto px-16 max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="space-y-12"
                        >
                            <div>
                                <p className="text-sm font-medium text-primary tracking-widest uppercase mb-4">Comment ça marche</p>
                                <h2 className="font-serif text-5xl">3 minutes. Ton programme.</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-8">
                                {[
                                    { step: '01', title: 'Réponds', desc: '7 questions sur ton niveau, objectif et disponibilités.' },
                                    { step: '02', title: 'Reçois', desc: 'L\'IA génère un programme sur-mesure, adapté à ta course.' },
                                    { step: '03', title: 'Progresse', desc: 'Check-in quotidien. Le programme évolue avec toi.' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.step}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: i * 0.15 }}
                                        className="p-8 rounded-3xl bg-card border border-border/50 shadow-sm"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                            <span className="text-primary font-serif text-xl">{item.step}</span>
                                        </div>
                                        <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Section 5: Social proof */}
                <section className="min-w-[100vw] h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
                    <div className="blob-bg w-[350px] h-[350px] bg-accent-warm/15 bottom-[10%] left-[10%]" style={{ animationDelay: '2s' }} />
                    <div className="container mx-auto px-16 max-w-5xl relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-3 gap-8">
                                {[
                                    { value: '500+', label: 'Runners actifs' },
                                    { value: '2 000+', label: 'Programmes générés' },
                                    { value: '98%', label: 'Taux de satisfaction' },
                                ].map((stat) => (
                                    <div key={stat.label} className="p-8 rounded-3xl bg-card border border-border/50 text-center shadow-sm">
                                        <p className="font-serif text-5xl text-primary mb-2">{stat.value}</p>
                                        <p className="text-muted-foreground">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                            <blockquote className="max-w-2xl mx-auto text-center">
                                <p className="font-serif text-2xl text-foreground/80 italic leading-relaxed">
                                    &ldquo;Depuis RunCoach, je ne cours plus au feeling. Chaque séance a un objectif. J&apos;ai battu mon record sur 10K en 8 semaines.&rdquo;
                                </p>
                                <footer className="mt-4 text-muted-foreground">- Marie, 34 ans, semi-marathonienne</footer>
                            </blockquote>
                        </motion.div>
                    </div>
                </section>

                {/* Section 6: CTA Final */}
                <section className="min-w-[100vw] h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
                    <div className="blob-bg w-[600px] h-[600px] bg-primary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="container mx-auto px-16 max-w-4xl text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="space-y-8"
                        >
                            <h2 className="font-serif text-6xl lg:text-7xl leading-[1.1]">
                                Commence ton{' '}
                                <span className="gradient-accent-text">parcours.</span>
                            </h2>
                            <p className="text-xl text-muted-foreground">
                                Gratuit. Sans engagement. Programme en 3 minutes.
                            </p>
                            <Link href="/onboarding">
                                <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-semibold text-xl px-12 py-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                    Créer Mon Programme
                                    <ArrowRight className="ml-3 w-6 h-6" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </div>

            {/* Progress dots */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
                {sections.map((s, i) => (
                    <button
                        key={s.id}
                        onClick={() => scrollToSection(i)}
                        className={`transition-all duration-300 rounded-full ${i === activeSection
                            ? 'w-8 h-3 bg-primary'
                            : 'w-3 h-3 bg-foreground/20 hover:bg-foreground/40'
                            }`}
                        aria-label={`Section ${i + 1}`}
                    />
                ))}
            </div>

            {/* Footer text on last slide */}
            <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 text-xs text-muted-foreground">
                © {new Date().getFullYear()} RunCoach.AI
            </div>
        </div>
    )
}
