'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Calendar, CheckCircle, Flame, ArrowRight, Trophy, Clock, MapPin } from 'lucide-react'
import type { Program, SessionTracking } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface DashboardClientProps {
    firstName: string
    program: Program | null
    tracking: SessionTracking[]
    isNew?: boolean
}

const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function DashboardClient({ firstName, program, tracking: initialTracking, isNew = false }: DashboardClientProps) {
    const [tracking, setTracking] = useState<SessionTracking[]>(initialTracking)
    const [showWelcome, setShowWelcome] = useState(isNew)

    // Calculate current week based on program start date
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

    // Calculate stats
    const totalSessions = program?.program_data.weeks.reduce((acc, week) => {
        return acc + week.sessions.filter(s => !s.rest_day).length
    }, 0) || 0

    const completedSessions = tracking.filter(t => t.completed).length
    const progressPercent = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

    // Calculate streak
    const calculateStreak = () => {
        if (!tracking.length) return 0
        const sortedTracking = [...tracking]
            .filter(t => t.completed)
            .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())

        if (!sortedTracking.length) return 0
        return sortedTracking.length // Simplified streak calculation
    }

    const streak = calculateStreak()

    // Find next session
    const getNextSession = () => {
        if (!currentWeekData) return null
        const completedInWeek = tracking.filter(t => t.week_number === currentWeek && t.completed)
        const completedDays = completedInWeek.map(t => t.session_day)

        for (const session of currentWeekData.sessions) {
            if (!session.rest_day && !completedDays.includes(session.day)) {
                return { ...session, weekNumber: currentWeek }
            }
        }
        return null
    }

    const nextSession = getNextSession()

    // Toggle session completion
    const toggleSession = async (weekNumber: number, day: string, completed: boolean) => {
        if (!program) return

        const supabase = createClient()
        const existingTracking = tracking.find(
            t => t.week_number === weekNumber && t.session_day === day
        )

        if (existingTracking) {
            // Update existing
            await supabase
                .from('session_tracking')
                .update({
                    completed,
                    completed_at: completed ? new Date().toISOString() : null
                })
                .eq('id', existingTracking.id)

            setTracking(prev => prev.map(t =>
                t.id === existingTracking.id
                    ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null }
                    : t
            ))
        } else {
            // Insert new
            const { data } = await supabase
                .from('session_tracking')
                .insert({
                    program_id: program.id,
                    user_id: program.user_id,
                    week_number: weekNumber,
                    session_day: day,
                    completed,
                    completed_at: completed ? new Date().toISOString() : null,
                })
                .select()
                .single()

            if (data) {
                setTracking(prev => [...prev, data])
            }
        }
    }

    const isSessionCompleted = (weekNumber: number, day: string) => {
        return tracking.some(t => t.week_number === weekNumber && t.session_day === day && t.completed)
    }

    // Dismiss welcome message
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
                    <Card className="text-center p-8">
                        <CardContent className="space-y-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                <Calendar className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Pas encore de programme</h2>
                                <p className="text-muted-foreground">
                                    Crée ton premier programme d&apos;entraînement personnalisé en 2 minutes !
                                </p>
                            </div>
                            <Link href="/onboarding">
                                <Button size="lg" className="font-semibold">
                                    Créer Mon Programme
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Welcome Banner */}
                {showWelcome && (
                    <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground animate-fade-in-up">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                                🎉
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Félicitations {firstName} !</h2>
                                <p className="opacity-90">Ton programme personnalisé est prêt. C&apos;est parti pour {program.program_data.program_summary.total_weeks} semaines de progression !</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">
                        Salut {firstName} ! 👋
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Tu es en <strong className="text-foreground">semaine {currentWeek}/{program.program_data.program_summary.total_weeks}</strong> de ton programme <strong className="text-foreground">{program.goal}</strong>
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Séances effectuées</p>
                                    <p className="text-2xl font-bold">{completedSessions}/{totalSessions}</p>
                                </div>
                            </div>
                            <Progress value={progressPercent} className="mt-4 h-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <Flame className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Streak actuel</p>
                                    <p className="text-2xl font-bold">{streak} séance{streak > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Prochaine séance</p>
                                    <p className="text-lg font-bold truncate">
                                        {nextSession ? `${nextSession.day} - ${nextSession.session_type}` : 'Tout fait ! 🎉'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Week Calendar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Semaine {currentWeek} - {currentWeekData?.focus}
                        </CardTitle>
                        <CardDescription>
                            Volume total : {currentWeekData?.total_volume_km} km • {currentWeekData?.notes}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {dayOrder.map((dayName) => {
                                const session = currentWeekData?.sessions.find(s => s.day === dayName)
                                const isCompleted = isSessionCompleted(currentWeek, dayName)

                                if (!session) {
                                    return (
                                        <div key={dayName} className="p-3 rounded-xl bg-muted/30 border border-dashed border-border text-center">
                                            <p className="text-xs text-muted-foreground mb-1">{dayName}</p>
                                            <p className="text-sm text-muted-foreground">-</p>
                                        </div>
                                    )
                                }

                                return (
                                    <div
                                        key={dayName}
                                        className={`p-4 rounded-xl border transition-all ${session.rest_day
                                            ? 'bg-muted/30 border-border'
                                            : isCompleted
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-primary/5 border-primary/20 hover:border-primary/40'
                                            }`}
                                    >
                                        <p className="text-xs text-muted-foreground mb-2 font-medium">{dayName}</p>
                                        {session.rest_day ? (
                                            <div className="space-y-1">
                                                <span className="text-xl">😴</span>
                                                <p className="text-sm font-medium">Repos</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-lg">🏃</span>
                                                    <span className="text-sm font-semibold truncate">{session.session_type}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                                    {session.duration_min && (
                                                        <span className="flex items-center gap-0.5">
                                                            <Clock className="w-3 h-3" />
                                                            {session.duration_min}min
                                                        </span>
                                                    )}
                                                    {session.distance_km && (
                                                        <span className="flex items-center gap-0.5">
                                                            <MapPin className="w-3 h-3" />
                                                            {session.distance_km}km
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="pt-2">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <Checkbox
                                                            checked={isCompleted}
                                                            onCheckedChange={(checked) =>
                                                                toggleSession(currentWeek, dayName, checked as boolean)
                                                            }
                                                        />
                                                        <span className="text-xs">
                                                            {isCompleted ? 'Fait ✓' : 'Marquer fait'}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* View Full Program Link */}
                <div className="text-center">
                    <Link href="/program">
                        <Button variant="outline" size="lg" className="font-semibold">
                            Voir le programme complet
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {/* Weekly Tip */}
                {program.program_data.tips && program.program_data.tips.length > 0 && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    💡
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Conseil de la semaine</p>
                                    <p className="text-muted-foreground">
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
