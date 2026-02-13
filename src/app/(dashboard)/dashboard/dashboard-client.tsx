'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, Flame, Clock, MapPin } from 'lucide-react'
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

    const reversedCheckIns = useMemo(() => recentCheckIns.slice().reverse(), [recentCheckIns])

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
                        {/* Adjustment banner */}
                        {todayAdjustment?.adjustment_made && (
                            <div className={`px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${
                                todayAdjustment.adjustment_made.intensity_reduction === 100
                                    ? 'bg-destructive/10 text-destructive border-b border-destructive/20'
                                    : 'bg-warning/10 text-warning border-b border-warning/20'
                            }`}>
                                <span>{todayAdjustment.adjustment_made.intensity_reduction === 100 ? '🛑' : '⚠️'}</span>
                                {todayAdjustment.adjustment_made.intensity_reduction === 100
                                    ? 'Repos recommandé aujourd\'hui'
                                    : `Séance allégée — ${todayAdjustment.adjustment_made.adjusted_type}`
                                }
                            </div>
                        )}
                        {todayAdjustment && !todayAdjustment.adjustment_made && todayAdjustment.feeling === 1 && (
                            <div className="px-4 py-2.5 text-sm font-medium flex items-center gap-2 bg-success/10 text-success border-b border-success/20">
                                <span>💪</span> En pleine forme !
                            </div>
                        )}
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
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <Card className="bg-card">
                        <CardContent className="pt-3 pb-3 sm:pt-5 sm:pb-5 text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Flame className="w-5 h-5 text-accent-warm" />
                            </div>
                            <p className="font-serif text-xl sm:text-2xl">{streak}</p>
                            <p className="text-xs text-muted-foreground">Streak</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardContent className="pt-3 pb-3 sm:pt-5 sm:pb-5 text-center">
                            <p className="font-serif text-xl sm:text-2xl">{completedSessions}<span className="text-muted-foreground text-base">/{totalSessions}</span></p>
                            <p className="text-xs text-muted-foreground">Séances</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardContent className="pt-3 pb-3 sm:pt-5 sm:pb-5 text-center">
                            <p className="font-serif text-xl sm:text-2xl">{currentWeekData?.total_volume_km || 0}</p>
                            <p className="text-xs text-muted-foreground">Km/semaine</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Check-ins History */}
                {recentCheckIns.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4">Tes derniers check-ins</h3>
                            <div className="flex items-center justify-between gap-2">
                                {reversedCheckIns.map((checkIn, i) => {
                                    const date = new Date(checkIn.date)
                                    const dayLabel = date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)
                                    const isRest = checkIn.adjustment_made?.intensity_reduction === 100
                                    const isAdjusted = checkIn.adjustment_made && !isRest

                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1.5 group relative">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all cursor-default ${
                                                checkIn.feeling === 1
                                                    ? 'bg-success/15 text-success border border-success/30'
                                                    : checkIn.feeling === 2
                                                        ? 'bg-warning/15 text-warning border border-warning/30'
                                                        : 'bg-destructive/15 text-destructive border border-destructive/30'
                                            }`}>
                                                {checkIn.feeling === 1 ? '💪' : checkIn.feeling === 2 ? '😴' : '🤕'}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
                                            {(isAdjusted || isRest) && (
                                                <div className={`w-1.5 h-1.5 rounded-full ${isRest ? 'bg-destructive' : 'bg-warning'}`} />
                                            )}
                                            {/* Tooltip on hover */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-card border border-border shadow-lg rounded-xl px-3 py-2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                                {checkIn.feeling === 1 ? 'En forme' : checkIn.feeling === 2 ? 'Fatigué' : 'Très fatigué'}
                                                {isAdjusted && <span className="block text-warning">{checkIn.adjustment_made!.adjusted_type}</span>}
                                                {isRest && <span className="block text-destructive">Repos forcé</span>}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Volume Trend — last 4 weeks */}
                {program && (() => {
                    const startIdx = Math.max(0, currentWeek - 4)
                    const trendWeeks = program.program_data.weeks.slice(startIdx, currentWeek)
                    const maxVolume = Math.max(...trendWeeks.map(w => w.total_volume_km || 0), 1)

                    return trendWeeks.length > 1 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-4">Volume récent</h3>
                                <div className="flex items-end gap-3 h-24">
                                    {trendWeeks.map((week) => {
                                        const volume = week.total_volume_km || 0
                                        const heightPct = maxVolume > 0 ? (volume / maxVolume) * 100 : 0
                                        const isCurrent = week.week_number === currentWeek

                                        return (
                                            <div key={week.week_number} className="flex-1 flex flex-col items-center gap-1">
                                                <span className="text-xs text-muted-foreground font-medium">{volume}km</span>
                                                <div
                                                    className={`w-full rounded-t-lg transition-all ${
                                                        isCurrent ? 'bg-primary' : 'bg-primary/30'
                                                    }`}
                                                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                                                />
                                                <span className={`text-[10px] ${isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                                                    S{week.week_number}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    ) : null
                })()}

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
