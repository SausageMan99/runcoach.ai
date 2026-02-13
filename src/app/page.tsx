'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Search, Mountain, Cloud, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { BetaBadge } from '@/components/landing/beta-badge'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
}

const stagger = {
    visible: {
        transition: { staggerChildren: 0.15 },
    },
}

const demoCourses = [
    { name: 'Marathon de Paris', detail: 'Route, D+ 50m, 8-15°C frais' },
    { name: 'Trail du Ventoux', detail: 'Trail, D+ 2600m, vent violent possible' },
    { name: 'Diagonale des Fous', detail: 'Ultra trail, D+ 9576m, tropical 5-30°C' },
]

export default function LandingPage() {
    const [raceQuery, setRaceQuery] = useState('')
    const [showResults, setShowResults] = useState(false)

    const filteredCourses = raceQuery.length > 0
        ? demoCourses.filter(c => c.name.toLowerCase().includes(raceQuery.toLowerCase()))
        : demoCourses

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-12 w-auto" />
                    <nav className="flex items-center gap-4 sm:gap-8">
                        <Link href="/login" className="hidden sm:block text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                            Connexion
                        </Link>
                        <Link href="/onboarding">
                            <Button size="sm" className="rounded-2xl bg-primary text-primary-foreground font-semibold px-5 sm:px-6">
                                Commencer
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-28 sm:pt-36 pb-20 sm:pb-28 px-6 min-h-[85vh] flex items-center relative overflow-hidden">
                <div className="blob-bg w-72 sm:w-[500px] h-72 sm:h-[500px] bg-primary/20 -top-20 right-[5%]" />
                <div className="blob-bg w-56 sm:w-[300px] h-56 sm:h-[300px] bg-accent-warm/20 bottom-10 left-[5%]" style={{ animationDelay: '4s' }} />
                <div className="relative z-10 container mx-auto max-w-5xl">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl space-y-8">
                        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
                            <BetaBadge />
                        </motion.div>
                        <motion.h1 variants={fadeUp} transition={{ duration: 0.7 }} className="font-serif text-5xl sm:text-7xl lg:text-8xl leading-[1.05]">
                            Le seul coach qui s&apos;adapte{' '}
                            <span className="gradient-accent-text">vraiment.</span>
                        </motion.h1>
                        <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                            Les plans statiques ne marchent pas. Joggeur ajuste ton programme chaque jour selon ta fatigue, ton terrain et ta course cible.
                        </motion.p>
                        <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col sm:flex-row items-start gap-4">
                            <Link href="/onboarding">
                                <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-semibold text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                    Cr&eacute;er Mon Programme
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </motion.div>
                        <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap gap-6 text-sm text-muted-foreground pt-2">
                            <span>Gratuit</span>
                            <span>3 min</span>
                            <span>50+ courses fran&ccedil;aises</span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Problem */}
            <section className="py-20 sm:py-28 px-6 bg-secondary">
                <div className="container mx-auto max-w-5xl">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-12">
                        <div className="max-w-3xl space-y-4">
                            <motion.p variants={fadeUp} className="text-sm font-medium text-primary tracking-widest uppercase">Le probl&egrave;me</motion.p>
                            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl leading-snug">
                                Pourquoi les plans classiques &eacute;chouent
                            </motion.h2>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6">
                            {[
                                {
                                    title: 'Trop optimistes',
                                    desc: 'Progression agressive, pas de marge pour la vie r\u00e9elle. R\u00e9sultat : blessure ou abandon.',
                                    icon: '📈',
                                },
                                {
                                    title: 'Pas adaptatifs',
                                    desc: 'Mal dormi ? Semaine stressante ? Le plan s\u2019en fiche. Il avance sans toi.',
                                    icon: '🤖',
                                },
                                {
                                    title: 'G\u00e9n\u00e9riques',
                                    desc: 'M\u00eame plan pour le Marathon de Paris plat et le Trail du Ventoux \u00e0 2600m D+.',
                                    icon: '📋',
                                },
                            ].map((item) => (
                                <motion.div key={item.title} variants={fadeUp} className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 shadow-sm">
                                    <div className="text-3xl mb-4">{item.icon}</div>
                                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Race Finder Demo */}
            <section className="py-20 sm:py-28 px-6 bg-secondary">
                <div className="container mx-auto max-w-5xl">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-12">
                        <div className="max-w-3xl space-y-4">
                            <motion.p variants={fadeUp} className="text-sm font-medium text-primary tracking-widest uppercase">Course cible</motion.p>
                            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl leading-snug">
                                Un plan calibr&eacute; sur <span className="gradient-accent-text">ta course</span>
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-muted-foreground leading-relaxed">
                                50+ courses fran&ccedil;aises dans la base. Terrain, d&eacute;nivel&eacute;, m&eacute;t&eacute;o typique : tout est int&eacute;gr&eacute; dans ton programme.
                            </motion.p>
                        </div>
                        <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-8 items-start">
                            {/* Demo input */}
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Recherche une course..."
                                        value={raceQuery}
                                        onChange={(e) => { setRaceQuery(e.target.value); setShowResults(true) }}
                                        onFocus={() => setShowResults(true)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                {showResults && (
                                    <div className="space-y-2">
                                        {filteredCourses.map((course) => (
                                            <div key={course.name} className="p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors cursor-default">
                                                <p className="font-semibold text-sm">{course.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{course.detail}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Benefits */}
                            <div className="space-y-4">
                                {[
                                    { icon: <Mountain className="w-5 h-5" />, title: 'Terrain adapt\u00e9', desc: 'S\u00e9ances de c\u00f4tes et descentes techniques pour le trail' },
                                    { icon: <MapPin className="w-5 h-5" />, title: 'D\u00e9nivel\u00e9 int\u00e9gr\u00e9', desc: 'Progression de D+ calibr\u00e9e sur le profil de ta course' },
                                    { icon: <Cloud className="w-5 h-5" />, title: 'M\u00e9t\u00e9o anticip\u00e9e', desc: 'Simulation des conditions (chaleur, froid, vent)' },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{item.title}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Solution */}
            <section className="py-20 sm:py-28 px-6 relative overflow-hidden">
                <div className="blob-bg w-72 sm:w-[400px] h-72 sm:h-[400px] bg-moss-light/15 top-[10%] right-[10%]" />
                <div className="container mx-auto max-w-5xl relative z-10">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-10">
                        <div className="max-w-3xl space-y-4">
                            <motion.p variants={fadeUp} className="text-sm font-medium text-primary tracking-widest uppercase">La solution</motion.p>
                            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl leading-snug">
                                Un coach IA qui comprend{' '}
                                <span className="gradient-accent-text">ton corps.</span>
                            </motion.h2>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6">
                            {[
                                { title: 'Adaptatif', desc: 'Check-in quotidien. Le programme s\u2019adapte \u00e0 ta fatigue, ton stress, ta forme du jour.' },
                                { title: 'Sp\u00e9cifique', desc: 'Terrain, d\u00e9nivel\u00e9, m\u00e9t\u00e9o de ta course cible int\u00e9gr\u00e9s dans chaque s\u00e9ance.' },
                                { title: 'Pr\u00e9ventif', desc: 'Score de risque blessure en temps r\u00e9el. Approche conservative 85/15.' },
                            ].map((item) => (
                                <motion.div key={item.title} variants={fadeUp} className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 shadow-sm">
                                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 sm:py-28 px-6 bg-secondary">
                <div className="container mx-auto max-w-5xl">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-12">
                        <div>
                            <motion.p variants={fadeUp} className="text-sm font-medium text-primary tracking-widest uppercase mb-4">Comment &ccedil;a marche</motion.p>
                            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-5xl">3 minutes. Ton programme.</motion.h2>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                            {[
                                { step: '01', title: 'R\u00e9ponds', desc: '7 questions sur ton niveau, objectif et disponibilit\u00e9s.' },
                                { step: '02', title: 'Re\u00e7ois', desc: 'L\u2019IA g\u00e9n\u00e8re un programme sur-mesure, adapt\u00e9 \u00e0 ta course.' },
                                { step: '03', title: 'Progresse', desc: 'Check-in quotidien. Le programme \u00e9volue avec toi.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.15 }}
                                    className="p-6 sm:p-8 rounded-3xl bg-card border border-border/50 shadow-sm"
                                >
                                    <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                        <span className="text-primary font-serif text-lg sm:text-xl">{item.step}</span>
                                    </div>
                                    <h3 className="font-semibold text-lg sm:text-xl mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Transparence */}
            <section className="py-16 sm:py-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="space-y-8">
                        <motion.h3 variants={fadeUp} className="font-serif text-2xl sm:text-3xl text-center">
                            Important &agrave; savoir
                        </motion.h3>
                        <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                            {[
                                { icon: '🚧', title: 'Prototype actif', desc: 'D\u00e9veloppement en cours. Des bugs sont possibles.' },
                                { icon: '🏃', title: 'Courses limit\u00e9es', desc: '~50 courses FR index\u00e9es. Option "course personnalis\u00e9e" disponible.' },
                                { icon: '💬', title: 'Tes retours comptent', desc: 'Chaque feedback aide \u00e0 am\u00e9liorer le produit.' },
                            ].map((item) => (
                                <div key={item.title} className="p-5 sm:p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                                    <div className="text-2xl mb-3">{item.icon}</div>
                                    <h4 className="font-semibold mb-1">{item.title}</h4>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-24 sm:py-32 px-6 relative overflow-hidden">
                <div className="blob-bg w-80 sm:w-[600px] h-80 sm:h-[600px] bg-primary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="space-y-8"
                    >
                        <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.1]">
                            Commence ton{' '}
                            <span className="gradient-accent-text">parcours.</span>
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground">
                            Gratuit. Sans engagement. Programme en 3 minutes.
                        </p>
                        <Link href="/onboarding">
                            <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-semibold text-lg sm:text-xl px-10 sm:px-12 py-6 sm:py-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                                Cr&eacute;er Mon Programme
                                <ArrowRight className="ml-2 sm:ml-3 w-5 sm:w-6 h-5 sm:h-6" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-border/50">
                <div className="container mx-auto flex flex-col items-center gap-4 text-sm text-muted-foreground">
                    <img src="/logo-full.svg" alt="Joggeur" className="h-10 w-auto" />
                    <nav className="flex gap-6">
                        <Link href="/terms" className="hover:text-foreground transition-colors">CGU</Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Confidentialit&eacute;</Link>
                    </nav>
                    <p>&copy; {new Date().getFullYear()} Joggeur</p>
                </div>
            </footer>
        </div>
    )
}
