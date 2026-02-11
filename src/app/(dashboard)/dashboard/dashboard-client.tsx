'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Flame, Clock, MapPin } from 'lucide-react'
import type { Program, SessionTracking, Race } from '@/types'
import { createClient } from '@/lib/supabase/client'
import DailyCheckInCard from '@/components/dashboard/daily-check-in-card'
import RaceCountdownCard from '@/components/dashboard/race-countdown-card'
import InjuryRiskWidget from '@/components/dashboard/injury-risk-widget'
import { calculateInjuryRisk } from '@/lib/utils/injury-risk'

interface DashboardClientProps {
    firstName: string
    program: Program | null
    tracking: SessionTracking[]
    isNew?: boolean
    hasCheckedInToday?: boolean
    race?: Race | null
    recentFeelings?: number[]
}

const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
}

export default function DashboardClient({
    firstName,
    program,
    tracking: initialTracking,
    isNew = false,
    hasCheckedInToday = false,
    race = null,
    recentFeelings = [],
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

    const totalSessions = program?.program_data.weeks.reduce((acc, week) => {
        return acc + week.sessions.filter(s => !s.rest_day).length
    }, 0) || 0

    const completedSessions = tracking.filter(t => t.completed).length

    const calculateStreak = () => {
        const completedTracking = tracking.filter(t => t.completed && t.completed_at)
        if (!completedTracking.length) return 0
        const sortedTracking = [...completedTracking]
            .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
        let streak = 0
        let currentDate = new Date(sortedTracking[0].completed_at!)
        for (const session of sortedTracking) {
            const sessionDate = new Date(session.completed_at!)
            const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
            if (streak > 0 && daysDiff > 3) break
            streak++
            currentDate = sessionDate
        }
        return streak
    }

    const streak = calculateStreak()

    const getNextSession = () => {
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
    }

    const nextSession = getNextSession()

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

    const toggleSession = async (weekNumber: number, day: string, completed: boolean) => {
        if (!program) return
        const supabase = createClient()
        const existingTracking = tracking.find(t => t.week_number === weekNumber && t.session_day === day)
        if (existingTracking) {
            await supabase.from('session_tracking').update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', existingTracking.id)
            setTracking(prev => prev.map(t => t.id === existingTracking.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t))
        } else {
            const { data } = await supabase.from('session_tracking').insert({ program_id: program.id, user_id: program.user_id, week_number: weekNumber, session_day: day, completed, completed_at: completed ? new Date().toISOString() : null }).select().single()
            if (data) setTracking(prev => [...prev, data])
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
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                            <span className="text-4xl">🏃</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-serif text-3xl">Pas encore de programme</h2>
                            <p className="text-muted-foreground text-lg">
                                Crée ton premier programme personnalisé en 2 minutes !
                            </p>
                        </div>
                        <Link href="/onboarding">
                            <Button size="lg" className="rounded-2xl bg-primary text-primary-foreground font-semibold px-8 py-6 shadow-lg shadow-primary/25">
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
        <div className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Welcome Banner */}
                {showWelcome && (
                    <div className="gradient-accent rounded-3xl p-6 text-white animate-fade-in-up">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">
                                🎉
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Félicitations {firstName} !</h2>
                                <p className="opacity-90">Ton programme de {program.program_data.program_summary.total_weeks} semaines est prêt.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header motivationnel */}
                <div className="space-y-1">
                    <h1 className="font-serif text-3xl">
                        {getGreeting()} {firstName}
                    </h1>
                    <p className="text-muted-foreground">
                        Semaine <strong className="text-foreground">{currentWeek}/{program.program_data.program_summary.total_weeks}</strong> &middot; {program.goal}
                    </p>
                </div>

                {/* Today's Session Card */}
                {nextSession && (
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-moss-light/5 overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                    <p className="text-sm font-medium text-primary">
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
                                    className="rounded-2xl bg-primary text-primary-foreground font-semibold px-6 shadow-md shadow-primary/20"
                                    disabled={isSessionCompleted(nextSession.weekNumber, nextSession.day)}
                                >
                                    {isSessionCompleted(nextSession.weekNumber, nextSession.day) ? 'Fait !' : "C'est parti !"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!nextSession && (
                    <Card className="border-success/20 bg-success/5">
                        <CardContent className="pt-6 text-center">
                            <p className="font-serif text-2xl">Programme terminé ! 🏆</p>
                            <p className="text-muted-foreground mt-1">Bravo, tu as tout donné !</p>
                        </CardContent>
                    </Card>
                )}

                {/* Daily Check-in */}
                {nextSession && (
                    <DailyCheckInCard
                        nextSessionWeek={nextSession.weekNumber}
                        nextSessionDay={nextSession.day}
                        hasCheckedInToday={hasCheckedInToday}
                    />
                )}

                {/* Race Countdown */}
                {race && <RaceCountdownCard race={race} />}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-card">
                        <CardContent className="pt-5 pb-5 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Flame className="w-5 h-5 text-accent-warm" />
                            </div>
                            <p className="font-serif text-2xl">{streak}</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardContent className="pt-5 pb-5 text-center">
                            <p className="font-serif text-2xl">{completedSessions}<span className="text-muted-foreground text-base">/{totalSessions}</span></p>
                            <p className="text-xs text-muted-foreground">Séances</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardContent className="pt-5 pb-5 text-center">
                            <p className="font-serif text-2xl">{currentWeekData?.total_volume_km || 0}</p>
                            <p className="text-xs text-muted-foreground">Km/semaine</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Injury Risk */}
                {injuryRisk && <InjuryRiskWidget risk={injuryRisk} />}

                {/* Week Timeline */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Semaine {currentWeek}</h3>
                            <span className="text-sm text-muted-foreground">{currentWeekData?.focus}</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {dayOrder.map((dayName) => {
                                const session = currentWeekData?.sessions.find(s => s.day === dayName)
                                const isCompleted = isSessionCompleted(currentWeek, dayName)
                                const isRest = session?.rest_day
                                const hasSession = session && !isRest

                                return (
                                    <div key={dayName} className="flex flex-col items-center gap-2 min-w-[60px]">
                                        <span className="text-[10px] text-muted-foreground font-medium">{dayName.slice(0, 3)}</span>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all ${isCompleted
                                            ? 'bg-success text-white'
                                            : isRest
                                                ? 'bg-muted/50 text-muted-foreground'
                                                : hasSession
                                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                                    : 'bg-muted/30 text-muted-foreground'
                                            }`}>
                                            {isCompleted ? '✓' : isRest ? '·' : hasSession ? '●' : '·'}
                                        </div>
                                        {hasSession && !isCompleted && (
                                            <Checkbox
                                                checked={isCompleted}
                                                onCheckedChange={(checked) => toggleSession(currentWeek, dayName, checked as boolean)}
                                                className="w-4 h-4"
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* View Full Program */}
                <div className="text-center">
                    <Link href="/program">
                        <Button variant="outline" className="rounded-2xl font-semibold border-border/50">
                            Voir le programme complet
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {/* Tip */}
                {program.program_data.tips && program.program_data.tips.length > 0 && (
                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                                    💡
                                </div>
                                <div>
                                    <p className="font-semibold text-sm mb-1">Conseil du jour</p>
                                    <p className="text-sm text-muted-foreground">
                                        {program.program_data.tips[currentWeek % program.program_data.tips.length]}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
