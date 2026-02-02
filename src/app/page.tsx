'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Target, TrendingUp, Zap, CheckCircle, ArrowRight, Timer, Calendar, Award } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-foreground">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="RunCoach.AI"
              width={48}
              height={48}
              className="rounded-none"
            />
            <span className="font-bold text-2xl tracking-tight">RunCoach<span className="font-normal">.AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
              Fonctionnalités
            </Link>
            <Link href="#how-it-works" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
              Comment ça marche
            </Link>
            <Link href="/login" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
              Connexion
            </Link>
          </nav>
          <Link href="/onboarding">
            <Button className="btn-artistic bg-primary text-primary-foreground font-bold px-6 py-5 text-base">
              Commencer
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 text-sm font-bold">
                <Zap className="w-4 h-4" />
                <span>POWERED BY AI</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Programme Running
                <br />
                <span className="relative">
                  Sur-Mesure
                  <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 10" fill="none">
                    <path d="M0 8 Q50 2, 100 8 T200 8" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-xl text-foreground/70 max-w-lg leading-relaxed">
                L&apos;IA coach qui s&apos;adapte à <strong className="text-foreground">ton niveau</strong>, <strong className="text-foreground">ton objectif</strong> et <strong className="text-foreground">ton planning</strong>.
                Fini les programmes génériques.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/onboarding">
                  <Button size="lg" className="btn-artistic w-full sm:w-auto bg-primary text-primary-foreground font-bold text-lg px-8 py-7">
                    Créer Mon Programme Gratuit
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline" className="btn-artistic w-full sm:w-auto font-bold text-lg px-8 py-7 border-2 border-foreground">
                    Comment ça marche ?
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 pt-4 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>100% Gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Sans engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>2 min chrono</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Logo + Preview */}
            <div className="relative">
              <div className="absolute -inset-4 border-2 border-foreground -rotate-3" />
              <div className="relative bg-card p-8 border-2 border-foreground">
                <Image
                  src="/logo.jpg"
                  alt="RunCoach.AI Runner"
                  width={400}
                  height={400}
                  className="mx-auto animate-bounce-subtle"
                />
                <div className="mt-6 p-4 bg-background border-2 border-foreground">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={day + i} className={`p-2 ${i === 0 || i === 2 || i === 5 ? 'bg-foreground text-background' : 'bg-muted'}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section id="features" className="py-24 px-4 bg-card border-y-2 border-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              La science du running, simplifiée par l&apos;IA.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border-2 border-foreground bg-background hover:-translate-y-2 hover:shadow-[4px_4px_0_currentColor] transition-all duration-200">
              <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">100% Personnalisé</h3>
              <p className="text-foreground/70 leading-relaxed">
                L&apos;algorithme analyse ton profil : niveau, objectif, disponibilités et blessures pour créer TON plan unique.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border-2 border-foreground bg-background hover:-translate-y-2 hover:shadow-[4px_4px_0_currentColor] transition-all duration-200">
              <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Progression Garantie</h3>
              <p className="text-foreground/70 leading-relaxed">
                Méthode Jack Daniels (VDOT). Progression graduelle, récupération intégrée, affûtage optimal avant ta course.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border-2 border-foreground bg-background hover:-translate-y-2 hover:shadow-[4px_4px_0_currentColor] transition-all duration-200">
              <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mb-6">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Prêt en 2 Minutes</h3>
              <p className="text-foreground/70 leading-relaxed">
                6 questions simples. Programme instantané. Pas de config compliquée, pas d&apos;abonnement pour commencer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ils ont atteint leurs objectifs
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "J'ai terminé mon premier 10K grâce à ce programme ! Le plan était vraiment adapté à mon emploi du temps.",
                author: "Marie",
                age: 32,
                goal: "Premier 10K"
              },
              {
                quote: "Enfin un plan qui s'adapte à mon emploi du temps chargé. J'ai progressé de 5 min sur mon semi !",
                author: "Thomas",
                age: 38,
                goal: "Semi < 1h45"
              },
              {
                quote: "Simple, efficace, et gratuit. Le suivi des séances me motive à rester régulier. Recommandé !",
                author: "Sophie",
                age: 28,
                goal: "Marathon"
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 border-2 border-foreground bg-card">
                <div className="flex gap-1 mb-4 text-2xl">
                  {[...Array(5)].map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed text-lg">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center font-bold text-xl bg-background">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.author}, {testimonial.age} ans</p>
                    <p className="text-sm text-foreground/70">Objectif : {testimonial.goal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-card border-y-2 border-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              3 étapes simples pour ton programme personnalisé
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: Timer,
                title: "Réponds à 6 questions",
                description: "Ton niveau, objectif, disponibilité... L'essentiel seulement."
              },
              {
                step: 2,
                icon: Zap,
                title: "L'IA génère ton plan",
                description: "Programme 12 semaines optimisé pour ton profil spécifique."
              },
              {
                step: 3,
                icon: Calendar,
                title: "Suis et progresse",
                description: "Consulte, coche tes séances, regarde ta progression."
              }
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-foreground text-background text-3xl font-black mb-8">
                  {item.step}
                </div>
                <div className="p-8 border-2 border-foreground bg-background">
                  <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mb-4 mx-auto">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-foreground/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute -inset-2 bg-foreground" />
            <div className="relative bg-background p-12 text-center border-2 border-foreground">
              <Award className="w-20 h-20 mx-auto mb-8" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Prêt à courir ?
              </h2>
              <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto">
                Rejoins les runners qui ont choisi un coaching intelligent.
                Commence maintenant, c&apos;est gratuit.
              </p>
              <Link href="/onboarding">
                <Button size="lg" className="btn-artistic bg-foreground text-background font-bold text-xl px-12 py-8">
                  Créer Mon Programme
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t-2 border-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="RunCoach.AI"
                width={40}
                height={40}
              />
              <span className="font-bold text-xl">RunCoach.AI</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              <Link href="/terms" className="hover:underline underline-offset-4">CGU</Link>
              <Link href="/privacy" className="hover:underline underline-offset-4">Confidentialité</Link>
            </nav>
            <p className="text-sm text-foreground/70">
              © 2024 RunCoach.AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
