'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import type { Program, SessionTracking, Race, AdjustedSession } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import DailyCheckInCard from '@/components/dashboard/daily-check-in-card'
import RaceCountdownCard from '@/components/dashboard/race-countdown-card'
import InjuryRiskWidget from '@/components/dashboard/injury-risk-widget'
import { calculateInjuryRisk } from '@/lib/utils/injury-risk'

interface RecentCheckIn {
    feeling: number
    date: string
    adjustment_made: AdjustedSession | null
}

interface DashboardClientProps {
    firstName: string
    program: Program | null
    tracking: SessionTracking[]
    isNew?: boolean
    hasCheckedInToday?: boolean
    race?: Race | null
    recentFeelings?: number[]
    todayAdjustment?: { feeling: number; adjustment_made: AdjustedSession | null } | null
    recentCheckIns?: RecentCheckIn[]
}

const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
}

function getDayName(): string {
    return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function DashboardClient({
    firstName,
    program,
    tracking: initialTracking,
    isNew = false,
    hasCheckedInToday = false,
    race = null,
    recentFeelings = [],
    todayAdjustment = null,
    recentCheckIns = [],
}: DashboardClientProps) {
    const [tracking, setTracking] = useState<SessionTracking[]>(initialTracking)
    const [showWelcome, setShowWelcome] = useState(isNew)

    const getCurrentWeek = () => {
        if (!program) return 1
        const startDate = new Date(program.created_at)
        const now = new Date()
        const diffTime = now.getTime() - startDate.getTime()
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
        return Math.max(1, Math.min(diffWeeks + 1, program.program_data.weeks.length))
    }

    const currentWeek = getCurrentWeek()
    const currentWeekData = program?.program_data.weeks.find(w => w.week_number === currentWeek)
    const lastWeekData = program?.program_data.weeks.find(w => w.week_number === currentWeek - 1)

    const totalSessions = useMemo(() => program?.program_data.weeks.reduce((acc, week) => {
        return acc + week.sessions.filter(s => !s.rest_day).length
    }, 0) || 0, [program])

    const completedSessions = useMemo(() => tracking.filter(t => t.completed).length, [tracking])

    const weekCompletedSessions = useMemo(() => {
        return tracking.filter(t => t.week_number === currentWeek && t.completed).length
    }, [tracking, currentWeek])

    const weekTotalSessions = useMemo(() => {
        return currentWeekData?.sessions.filter(s => !s.rest_day).length || 0
    }, [currentWeekData])

    const weekProgressPercent = weekTotalSessions > 0 ? Math.round((weekCompletedSessions / weekTotalSessions) * 100) : 0

    const streak = useMemo(() => {
        const completedTracking = tracking.filter(t => t.completed && t.completed_at)
        if (!completedTracking.length) return 0
        const sortedTracking = [...completedTracking]
            .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
        let s = 0
        let currentDate = new Date(sortedTracking[0].completed_at!)
        for (const session of sortedTracking) {
            const sessionDate = new Date(session.completed_at!)
            const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
            if (s > 0 && daysDiff > 3) break
            s++
            currentDate = sessionDate
        }
        return s
    }, [tracking])

    const nextSession = useMemo(() => {
        if (!program || !currentWeekData) return null
        const completedInWeek = tracking.filter(t => t.week_number === currentWeek && t.completed)
        const completedDays = completedInWeek.map(t => t.session_day)
        for (const session of currentWeekData.sessions) {
            if (!session.rest_day && !completedDays.includes(session.day)) {
                return { ...session, weekNumber: currentWeek, isNextWeek: false }
            }
        }
        if (currentWeek < program.program_data.weeks.length) {
            const nextWeekData = program.program_data.weeks[currentWeek]
            const firstSession = nextWeekData?.sessions.find(s => !s.rest_day)
            if (firstSession) {
                return { ...firstSession, weekNumber: currentWeek + 1, isNextWeek: true }
            }
        }
        return null
    }, [program, currentWeekData, currentWeek, tracking])

    const injuryRisk = useMemo(() => {
        if (!program || !currentWeekData) return null
        const currentVolume = currentWeekData.total_volume_km || 0
        const lastVolume = lastWeekData?.total_volume_km || 0
        const trainingSessions = currentWeekData.sessions.filter(s => !s.rest_day)
        const intenseSessions = trainingSessions.filter(s =>
            s.session_type?.toLowerCase().includes('fractionné') ||
            s.session_type?.toLowerCase().includes('interval') ||
            s.session_type?.toLowerCase().includes('tempo') ||
            s.session_type?.toLowerCase().includes('seuil') ||
            (s.rpe && s.rpe >= 7)
        ).length
        const restDays = currentWeekData.sessions.filter(s => s.rest_day).length
        return calculateInjuryRisk({
            currentWeekVolume: currentVolume,
            lastWeekVolume: lastVolume,
            intenseSessions,
            totalSessions: trainingSessions.length,
            recentFeelings,
            hasStrengthWork: false,
            restDaysThisWeek: restDays,
        })
    }, [program, currentWeekData, lastWeekData, recentFeelings])

    const riskLevel = injuryRisk?.level || 'low'
    const riskLabel = riskLevel === 'low' ? 'Faible' : riskLevel === 'medium' ? 'Modéré' : 'Élevé'

    const toggleSession = async (weekNumber: number, day: string, completed: boolean) => {
        if (!program) return
        const previousTracking = [...tracking]
        try {
            const supabase = createClient()
            const existingTracking = tracking.find(t => t.week_number === weekNumber && t.session_day === day)
            if (existingTracking) {
                setTracking(prev => prev.map(t => t.id === existingTracking.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t))
                const { error } = await supabase.from('session_tracking').update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', existingTracking.id)
                if (error) throw error
            } else {
                const { data, error } = await supabase.from('session_tracking').insert({ program_id: program.id, user_id: program.user_id, week_number: weekNumber, session_day: day, completed, completed_at: completed ? new Date().toISOString() : null }).select().single()
                if (error) throw error
                if (data) setTracking(prev => [...prev, data])
            }
        } catch {
            setTracking(previousTracking)
            toast.error('Impossible de mettre à jour la séance')
        }
    }

    const isSessionCompleted = (weekNumber: number, day: string) => {
        return tracking.some(t => t.week_number === weekNumber && t.session_day === day && t.completed)
    }

    useEffect(() => {
        if (showWelcome) {
            const timer = setTimeout(() => setShowWelcome(false), 5000)
            return () => clearTimeout(timer)
        }
    }, [showWelcome])

    if (!program) {
        return (
            <div className="p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20 space-y-6">
                        <div className="w-20 h-20 bg-forest/10 rounded-xl flex items-center justify-center mx-auto border-2 border-forest/20">
                            <span className="text-4xl">🏃</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-3xl">Pas encore de programme</h2>
                            <p className="text-muted-foreground text-lg">
                                Crée ton premier programme personnalisé en 2 minutes !
                            </p>
                        </div>
                        <Link href="/onboarding">
                            <Button size="lg" className="rounded-lg bg-forest text-white font-semibold px-8 py-6 hover:bg-forest-dim transition-all border-2 border-forest" style={{ boxShadow: '4px 4px 0px #1A1A1A' }}>
                                Créer Mon Programme
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* STICKY TOP - Check-in quotidien */}
            {nextSession && !hasCheckedInToday && (
                <div className="sticky top-0 z-[100] bg-background/90 backdrop-blur-xl border-b-2 border-foreground/10 p-4" style={{ boxShadow: '0 4px 0px rgba(26, 26, 26, 0.05)' }}>
                    <div className="container max-w-4xl mx-auto">
                        <p className="text-sm font-medium mb-2">
                            Aujourd&apos;hui &bull; {getDayName()}
                        </p>
                        <h2 className="text-2xl font-bold mb-3">
                            {nextSession.session_type}
                            {nextSession.duration_min && ` \u2022 ${nextSession.duration_min}min`}
                            {nextSession.distance_km && ` \u2022 ${nextSession.distance_km}km`}
                        </h2>
                        <p className="text-sm text-grey mb-3">
                            Comment te sens-tu aujourd&apos;hui ?
                        </p>
                        <DailyCheckInCard
                            nextSessionWeek={nextSession.weekNumber}
                            nextSessionDay={nextSession.day}
                            hasCheckedInToday={hasCheckedInToday}
                        />
                    </div>
                </div>
            )}

            {/* Welcome Banner */}
            {showWelcome && (
                <div className="container max-w-4xl mx-auto px-4 pt-6">
                    <div className="bg-forest rounded-lg p-6 text-white animate-fade-in-up border-2 border-forest-dim" style={{ boxShadow: '4px 4px 0px #1A1A1A' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                                🎉
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Félicitations {firstName} !</h2>
                                <p className="opacity-90">Ton programme de {program.program_data.program_summary.total_weeks} semaines est prêt.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SCROLLABLE CONTENT */}
            <div className="container max-w-4xl mx-auto p-4 space-y-6 pb-20">
                {/* Header motivationnel */}
                <div className="space-y-1">
                    <h1 className="font-serif text-3xl">
                        {getGreeting()} {firstName}
                    </h1>
                    <p className="text-muted-foreground">
                        Semaine <strong className="text-foreground">{currentWeek}/{program.program_data.program_summary.total_weeks}</strong> &middot; {program.goal}
                    </p>
                </div>

                {/* Adjustment banner */}
                {todayAdjustment?.adjustment_made && (
                    <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 border-2 ${
                        todayAdjustment.adjustment_made.intensity_reduction === 100
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-warning/10 text-warning border-warning/20'
                    }`}>
                        <span>{todayAdjustment.adjustment_made.intensity_reduction === 100 ? '🛑' : '⚠️'}</span>
                        {todayAdjustment.adjustment_made.intensity_reduction === 100
                            ? 'Repos recommandé aujourd\'hui'
                            : `Séance allégée — ${todayAdjustment.adjustment_made.adjusted_type}`
                        }
                    </div>
                )}
                {todayAdjustment && !todayAdjustment.adjustment_made && todayAdjustment.feeling === 1 && (
                    <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 bg-forest/10 text-forest border-2 border-forest/20">
                        <span>💪</span> En pleine forme !
                    </div>
                )}

                {/* Week progress */}
                <div className="card-brutal p-6">
                    <div className="flex justify-between items-center mb-2">
                        <p className="font-bold">Semaine {currentWeek}/{program.program_data.program_summary.total_weeks}</p>
                        <p className="text-sm text-grey">{weekCompletedSessions}/{weekTotalSessions} séances</p>
                    </div>
                    <div className="w-full bg-grey/20 rounded-full h-3">
                        <div
                            className="bg-forest h-3 rounded-full transition-all"
                            style={{ width: `${weekProgressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Race Countdown */}
                {race && (
                    <div className="card-brutal p-6 bg-forest/5">
                        <p className="text-sm font-bold mb-1">Objectif course</p>
                        <h3 className="text-2xl font-bold mb-2">{race.name}</h3>
                        <p className="text-grey mb-2">
                            {race.distance_km}km &bull; {new Date(race.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-3xl font-bold font-serif text-forest">
                            J-{Math.max(0, Math.ceil((new Date(race.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                        </p>
                    </div>
                )}

                {/* Stats grid 2x2 */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="card-brutal p-4">
                        <p className="text-sm text-grey mb-1">Streak</p>
                        <p className="text-3xl font-bold">🔥 {streak}</p>
                    </div>
                    <div className="card-brutal p-4">
                        <p className="text-sm text-grey mb-1">Séances</p>
                        <p className="text-3xl font-bold">⚡ {completedSessions}/{totalSessions}</p>
                    </div>
                    <div className="card-brutal p-4">
                        <p className="text-sm text-grey mb-1">Cette semaine</p>
                        <p className="text-3xl font-bold">📊 {currentWeekData?.total_volume_km || 0} km</p>
                    </div>
                    <div className="card-brutal p-4">
                        <p className="text-sm text-grey mb-1">Risque</p>
                        <p className="text-3xl font-bold">
                            {riskLevel === 'low' && '✅'}
                            {riskLevel === 'medium' && '⚠️'}
                            {riskLevel === 'high' && '🔴'}
                            {' '}{riskLabel}
                        </p>
                    </div>
                </div>

                {/* Calendar week */}
                <div className="card-brutal p-6">
                    <h3 className="font-bold mb-4">Calendrier semaine</h3>
                    <div className="flex justify-between">
                        {dayOrder.map((dayName) => {
                            const session = currentWeekData?.sessions.find(s => s.day === dayName)
                            const isCompleted = isSessionCompleted(currentWeek, dayName)
                            const isRest = session?.rest_day
                            const hasSession = session && !isRest

                            return (
                                <div key={dayName} className="flex flex-col items-center gap-2">
                                    <p className="text-xs text-grey">{dayName.slice(0, 3)}</p>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2 ${
                                        isCompleted
                                            ? 'bg-forest text-white border-forest-dim'
                                            : 'bg-grey/10 border-grey/20'
                                    }`}>
                                        {isCompleted ? '✓' : '○'}
                                    </div>
                                    {hasSession && !isCompleted && (
                                        <Checkbox
                                            checked={isCompleted}
                                            onCheckedChange={(checked) => toggleSession(currentWeek, dayName, checked as boolean)}
                                            className="w-4 h-4"
                                            aria-label={`Marquer ${dayName} comme fait`}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Today's Session Card (if check-in done) */}
                {nextSession && hasCheckedInToday && (
                    <div className="card-brutal p-6 bg-forest/5 border-forest/30">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <p className="text-sm font-bold text-forest">
                                    {nextSession.isNextWeek ? `Semaine prochaine - ${nextSession.day}` : `Aujourd'hui - ${nextSession.day}`}
                                </p>
                                <h3 className="font-serif text-2xl">{nextSession.session_type}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    {nextSession.duration_min && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {nextSession.duration_min} min
                                        </span>
                                    )}
                                    {nextSession.distance_km && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {nextSession.distance_km} km
                                        </span>
                                    )}
                                </div>
                                {nextSession.description && (
                                    <p className="text-sm text-muted-foreground max-w-md">{nextSession.description}</p>
                                )}
                            </div>
                            <Button
                                onClick={() => toggleSession(nextSession.weekNumber, nextSession.day, true)}
                                className="rounded-lg bg-forest text-white font-semibold px-6 hover:bg-forest-dim border-2 border-forest"
                                disabled={isSessionCompleted(nextSession.weekNumber, nextSession.day)}
                                style={{ boxShadow: '3px 3px 0px #1A1A1A' }}
                            >
                                {isSessionCompleted(nextSession.weekNumber, nextSession.day) ? 'Fait !' : "C'est parti !"}
                            </Button>
                        </div>
                    </div>
                )}

                {!nextSession && (
                    <div className="card-brutal p-6 bg-forest/5 border-forest/30 text-center">
                        <p className="font-serif text-2xl">Programme terminé ! 🏆</p>
                        <p className="text-muted-foreground mt-1">Bravo, tu as tout donné !</p>
                    </div>
                )}

                {/* Injury Risk (detailed) */}
                {injuryRisk && <InjuryRiskWidget risk={injuryRisk} />}

                {/* View Full Program */}
                <div className="text-center">
                    <Link href="/program">
                        <Button variant="outline" className="rounded-lg font-semibold border-2 border-foreground/20" style={{ boxShadow: '3px 3px 0px rgba(26, 26, 26, 0.1)' }}>
                            Voir le programme complet
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {/* Tip */}
                {program.program_data.tips && program.program_data.tips.length > 0 && (
                    <div className="card-brutal p-6 bg-forest/5">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-forest/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg border-2 border-forest/20">
                                💡
                            </div>
                            <div>
                                <p className="font-bold text-sm mb-1">Conseil du jour</p>
                                <p className="text-sm text-muted-foreground">
                                    {program.program_data.tips[currentWeek % program.program_data.tips.length]}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
