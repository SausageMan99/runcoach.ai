'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, MapPin, Zap, Target, ChevronRight } from 'lucide-react'
import type { Program, SessionTracking, Week, Session } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface ProgramClientProps {
    program: Program
    tracking: SessionTracking[]
}

const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export default function ProgramClient({ program, tracking: initialTracking }: ProgramClientProps) {
    const [tracking, setTracking] = useState<SessionTracking[]>(initialTracking)
    const [notes, setNotes] = useState<Record<string, string>>({})

    const weeks = program.program_data.weeks

    // Calculate current week
    const getCurrentWeek = () => {
        const startDate = new Date(program.created_at)
        const now = new Date()
        const diffTime = now.getTime() - startDate.getTime()
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
        return Math.max(1, Math.min(diffWeeks + 1, weeks.length))
    }

    const currentWeek = getCurrentWeek()

    // Toggle session completion
    const toggleSession = async (weekNumber: number, day: string, completed: boolean) => {
        const supabase = createClient()
        const existingTracking = tracking.find(
            t => t.week_number === weekNumber && t.session_day === day
        )

        if (existingTracking) {
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

    // Save notes
    const saveNotes = async (weekNumber: number, day: string, noteText: string) => {
        const supabase = createClient()
        const existingTracking = tracking.find(
            t => t.week_number === weekNumber && t.session_day === day
        )

        if (existingTracking) {
            await supabase
                .from('session_tracking')
                .update({ notes: noteText })
                .eq('id', existingTracking.id)

            setTracking(prev => prev.map(t =>
                t.id === existingTracking.id ? { ...t, notes: noteText } : t
            ))
        } else {
            const { data } = await supabase
                .from('session_tracking')
                .insert({
                    program_id: program.id,
                    user_id: program.user_id,
                    week_number: weekNumber,
                    session_day: day,
                    completed: false,
                    notes: noteText,
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

    const getSessionNotes = (weekNumber: number, day: string) => {
        const trackingItem = tracking.find(t => t.week_number === weekNumber && t.session_day === day)
        return trackingItem?.notes || ''
    }

    const getWeekProgress = (week: Week) => {
        const trainingSessions = week.sessions.filter(s => !s.rest_day)
        const completed = trainingSessions.filter(s =>
            isSessionCompleted(week.week_number, s.day)
        ).length
        return { completed, total: trainingSessions.length }
    }

    // Get session type icon
    const getSessionIcon = (sessionType: string | undefined) => {
        if (!sessionType) return '🏃'
        const type = sessionType.toLowerCase()
        if (type.includes('fractionné') || type.includes('interval')) return '⚡'
        if (type.includes('long') || type.includes('sortie')) return '🏃‍♂️'
        if (type.includes('tempo') || type.includes('seuil')) return '🔥'
        if (type.includes('récup') || type.includes('easy')) return '🌿'
        return '🏃'
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-primary" />
                        Mon Programme
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {program.goal} • {program.program_data.program_summary.total_weeks} semaines
                    </p>
                </div>

                {/* Program Summary */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="grid sm:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-2xl font-bold">{program.program_data.program_summary.total_weeks}</p>
                                <p className="text-sm text-muted-foreground">Semaines</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-2xl font-bold">{program.program_data.program_summary.total_sessions}</p>
                                <p className="text-sm text-muted-foreground">Séances</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-2xl font-bold">{program.program_data.program_summary.peak_week_volume_km}</p>
                                <p className="text-sm text-muted-foreground">Km max/semaine</p>
                            </div>
                        </div>
                        <p className="mt-6 text-center text-muted-foreground italic">
                            &ldquo;{program.program_data.program_summary.philosophy}&rdquo;
                        </p>
                    </CardContent>
                </Card>

                {/* Week Tabs */}
                <Tabs defaultValue={`week-${currentWeek}`} className="space-y-4">
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="inline-flex h-auto p-1 gap-1">
                            {weeks.map((week) => {
                                const progress = getWeekProgress(week)
                                const isComplete = progress.completed === progress.total
                                const isCurrent = week.week_number === currentWeek

                                return (
                                    <TabsTrigger
                                        key={week.week_number}
                                        value={`week-${week.week_number}`}
                                        className={`px-4 py-2 ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''
                                            } ${isComplete ? 'bg-green-100' : ''}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            S{week.week_number}
                                            {isComplete && <span className="text-green-600">✓</span>}
                                        </span>
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </div>

                    {weeks.map((week) => {
                        const progress = getWeekProgress(week)
                        const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0

                        return (
                            <TabsContent key={week.week_number} value={`week-${week.week_number}`}>
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    Semaine {week.week_number}
                                                    {week.week_number === currentWeek && (
                                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                                            En cours
                                                        </span>
                                                    )}
                                                </CardTitle>
                                                <CardDescription className="mt-1">
                                                    {week.focus} • {week.total_volume_km} km
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-muted-foreground">
                                                    {progress.completed}/{progress.total} séances
                                                </span>
                                                <Progress value={progressPercent} className="w-20 h-2" />
                                            </div>
                                        </div>
                                        {week.notes && (
                                            <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-3 rounded-lg">
                                                💡 {week.notes}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <Accordion type="multiple" className="space-y-2">
                                            {dayOrder.map((dayName) => {
                                                const session = week.sessions.find(s => s.day === dayName)
                                                if (!session) return null

                                                const isCompleted = isSessionCompleted(week.week_number, dayName)
                                                const sessionNotes = getSessionNotes(week.week_number, dayName)
                                                const noteKey = `${week.week_number}-${dayName}`

                                                return (
                                                    <AccordionItem
                                                        key={dayName}
                                                        value={dayName}
                                                        className={`border rounded-xl px-4 ${session.rest_day
                                                                ? 'bg-muted/30'
                                                                : isCompleted
                                                                    ? 'bg-green-50 border-green-200'
                                                                    : 'bg-card'
                                                            }`}
                                                    >
                                                        <AccordionTrigger className="hover:no-underline py-4">
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <span className="text-2xl">
                                                                    {session.rest_day ? '😴' : getSessionIcon(session.session_type)}
                                                                </span>
                                                                <div className="text-left flex-1">
                                                                    <p className="font-semibold">{dayName}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {session.rest_day ? 'Jour de repos' : session.session_type}
                                                                    </p>
                                                                </div>
                                                                {!session.rest_day && (
                                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                        {session.duration_min && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="w-4 h-4" />
                                                                                {session.duration_min}min
                                                                            </span>
                                                                        )}
                                                                        {session.distance_km && (
                                                                            <span className="flex items-center gap-1">
                                                                                <MapPin className="w-4 h-4" />
                                                                                {session.distance_km}km
                                                                            </span>
                                                                        )}
                                                                        {isCompleted && (
                                                                            <span className="text-green-600 font-medium">✓ Fait</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pb-4">
                                                            <div className="space-y-4 pl-12">
                                                                {/* Session Details */}
                                                                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                                                                    {session.pace_target && (
                                                                        <p className="text-sm">
                                                                            <strong>Allure cible :</strong> {session.pace_target}
                                                                        </p>
                                                                    )}
                                                                    {session.workout_structure && (
                                                                        <p className="text-sm">
                                                                            <strong>Structure :</strong> {session.workout_structure}
                                                                        </p>
                                                                    )}
                                                                    {session.intervals && (
                                                                        <div className="text-sm">
                                                                            <strong>Intervalles :</strong>
                                                                            <ul className="list-disc list-inside mt-1 ml-2 space-y-1">
                                                                                <li>{session.intervals.repetitions}x {session.intervals.distance_m}m à {session.intervals.pace_target}</li>
                                                                                <li>Récup: {session.intervals.recovery}</li>
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    {session.rpe && (
                                                                        <p className="text-sm">
                                                                            <strong>Intensité perçue :</strong> {session.rpe}/10
                                                                        </p>
                                                                    )}
                                                                    <p className="text-sm whitespace-pre-wrap">
                                                                        {session.description}
                                                                    </p>
                                                                </div>

                                                                {/* Tracking & Notes */}
                                                                {!session.rest_day && (
                                                                    <div className="space-y-4">
                                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                                            <Checkbox
                                                                                checked={isCompleted}
                                                                                onCheckedChange={(checked) =>
                                                                                    toggleSession(week.week_number, dayName, checked as boolean)
                                                                                }
                                                                            />
                                                                            <span className="font-medium">
                                                                                {isCompleted ? 'Séance effectuée ✓' : 'Marquer comme effectuée'}
                                                                            </span>
                                                                        </label>

                                                                        <div className="space-y-2">
                                                                            <label className="text-sm font-medium">Notes personnelles</label>
                                                                            <Textarea
                                                                                placeholder="Comment s'est passée ta séance ?"
                                                                                value={notes[noteKey] ?? sessionNotes}
                                                                                onChange={(e) => setNotes(prev => ({ ...prev, [noteKey]: e.target.value }))}
                                                                                rows={2}
                                                                            />
                                                                            {(notes[noteKey] !== undefined && notes[noteKey] !== sessionNotes) && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        saveNotes(week.week_number, dayName, notes[noteKey])
                                                                                    }}
                                                                                >
                                                                                    Sauvegarder les notes
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                )
                                            })}
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )
                    })}
                </Tabs>

                {/* Tips Section */}
                {program.program_data.tips && program.program_data.tips.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>💡 Conseils du coach</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {program.program_data.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <ChevronRight className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
