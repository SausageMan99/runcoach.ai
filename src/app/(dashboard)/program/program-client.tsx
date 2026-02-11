'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, MapPin, Target, Zap, ChevronRight } from 'lucide-react'
import type { Program, SessionTracking, Week } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface ProgramClientProps {
    program: Program
    tracking: SessionTracking[]
}

const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

function getSessionColor(sessionType: string | undefined): string {
    if (!sessionType) return 'border-border/50'
    const type = sessionType.toLowerCase()
    if (type.includes('fractionné') || type.includes('interval')) return 'border-accent-warm/40 bg-accent-warm/5'
    if (type.includes('long') || type.includes('sortie')) return 'border-primary/40 bg-primary/5'
    if (type.includes('tempo') || type.includes('seuil')) return 'border-warning/40 bg-warning/5'
    if (type.includes('récup') || type.includes('easy')) return 'border-success/40 bg-success/5'
    return 'border-border/50'
}

export default function ProgramClient({ program, tracking: initialTracking }: ProgramClientProps) {
    const [tracking, setTracking] = useState<SessionTracking[]>(initialTracking)
    const [notes, setNotes] = useState<Record<string, string>>({})
    const [expandedSession, setExpandedSession] = useState<string | null>(null)
    const weekScrollRef = useRef<HTMLDivElement>(null)

    const weeks = program.program_data.weeks

    const getCurrentWeek = () => {
        const startDate = new Date(program.created_at)
        const now = new Date()
        const diffTime = now.getTime() - startDate.getTime()
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
        return Math.max(1, Math.min(diffWeeks + 1, weeks.length))
    }

    const currentWeek = getCurrentWeek()
    const [selectedWeek, setSelectedWeek] = useState(currentWeek)
    const selectedWeekData = weeks.find(w => w.week_number === selectedWeek)

    const toggleSession = async (weekNumber: number, day: string, completed: boolean) => {
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

    const saveNotes = async (weekNumber: number, day: string, noteText: string) => {
        const supabase = createClient()
        const existingTracking = tracking.find(t => t.week_number === weekNumber && t.session_day === day)
        if (existingTracking) {
            await supabase.from('session_tracking').update({ notes: noteText }).eq('id', existingTracking.id)
            setTracking(prev => prev.map(t => t.id === existingTracking.id ? { ...t, notes: noteText } : t))
        } else {
            const { data } = await supabase.from('session_tracking').insert({ program_id: program.id, user_id: program.user_id, week_number: weekNumber, session_day: day, completed: false, notes: noteText }).select().single()
            if (data) setTracking(prev => [...prev, data])
        }
    }

    const isSessionCompleted = (weekNumber: number, day: string) => {
        return tracking.some(t => t.week_number === weekNumber && t.session_day === day && t.completed)
    }

    const getSessionNotes = (weekNumber: number, day: string) => {
        return tracking.find(t => t.week_number === weekNumber && t.session_day === day)?.notes || ''
    }

    const getWeekProgress = (week: Week) => {
        const trainingSessions = week.sessions.filter(s => !s.rest_day)
        const completed = trainingSessions.filter(s => isSessionCompleted(week.week_number, s.day)).length
        return { completed, total: trainingSessions.length }
    }

    const totalCompleted = tracking.filter(t => t.completed).length
    const totalSessionsAll = weeks.reduce((acc, w) => acc + w.sessions.filter(s => !s.rest_day).length, 0)
    const globalProgress = totalSessionsAll > 0 ? (totalCompleted / totalSessionsAll) * 100 : 0

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-1">
                    <h1 className="font-serif text-3xl">Mon Programme</h1>
                    <p className="text-muted-foreground">{program.goal} &middot; {program.program_data.program_summary.total_weeks} semaines</p>
                </div>

                {/* Global Progress */}
                <Card className="bg-gradient-to-br from-primary/5 to-moss-light/5 border-primary/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Progression globale</span>
                            <span className="text-sm text-primary font-semibold">{Math.round(globalProgress)}%</span>
                        </div>
                        <Progress value={globalProgress} className="h-2" />
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="text-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <p className="font-semibold">{program.program_data.program_summary.total_weeks}</p>
                                <p className="text-xs text-muted-foreground">Semaines</p>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <Zap className="w-5 h-5 text-primary" />
                                </div>
                                <p className="font-semibold">{program.program_data.program_summary.total_sessions}</p>
                                <p className="text-xs text-muted-foreground">Séances</p>
                            </div>
                            <div className="text-center">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <p className="font-semibold">{program.program_data.program_summary.peak_week_volume_km}</p>
                                <p className="text-xs text-muted-foreground">Km max/sem</p>
                            </div>
                        </div>
                        {program.program_data.program_summary.philosophy && (
                            <p className="mt-4 text-center text-sm text-muted-foreground italic">
                                &ldquo;{program.program_data.program_summary.philosophy}&rdquo;
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Week Selector - Horizontal scroll */}
                <div ref={weekScrollRef} className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                    {weeks.map((week) => {
                        const progress = getWeekProgress(week)
                        const isComplete = progress.completed === progress.total
                        const isCurrent = week.week_number === currentWeek
                        const isSelected = week.week_number === selectedWeek

                        return (
                            <button
                                key={week.week_number}
                                onClick={() => setSelectedWeek(week.week_number)}
                                className={`flex-shrink-0 px-4 py-3 rounded-2xl border-2 transition-all text-sm ${isSelected
                                    ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                    : isCurrent
                                        ? 'border-primary/30 bg-primary/5'
                                        : isComplete
                                            ? 'border-success/30 bg-success/5'
                                            : 'border-border/50 bg-card'
                                    }`}
                            >
                                <span className="font-medium">S{week.week_number}</span>
                                {isComplete && !isSelected && <span className="ml-1 text-success">✓</span>}
                            </button>
                        )
                    })}
                </div>

                {/* Selected Week */}
                {selectedWeekData && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold">
                                    Semaine {selectedWeekData.week_number}
                                    {selectedWeekData.week_number === currentWeek && (
                                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">En cours</span>
                                    )}
                                </h3>
                                <span className="text-sm text-muted-foreground">{getWeekProgress(selectedWeekData).completed}/{getWeekProgress(selectedWeekData).total}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{selectedWeekData.focus} &middot; {selectedWeekData.total_volume_km} km</p>
                            {selectedWeekData.notes && (
                                <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-xl mb-4">{selectedWeekData.notes}</p>
                            )}

                            <div className="space-y-2">
                                {dayOrder.map((dayName) => {
                                    const session = selectedWeekData.sessions.find(s => s.day === dayName)
                                    if (!session) return null

                                    const isCompleted = isSessionCompleted(selectedWeekData.week_number, dayName)
                                    const sessionNotes = getSessionNotes(selectedWeekData.week_number, dayName)
                                    const noteKey = `${selectedWeekData.week_number}-${dayName}`
                                    const isExpanded = expandedSession === noteKey

                                    return (
                                        <div
                                            key={dayName}
                                            className={`rounded-2xl border transition-all ${session.rest_day
                                                ? 'bg-muted/20 border-border/30'
                                                : isCompleted
                                                    ? 'bg-success/5 border-success/20'
                                                    : getSessionColor(session.session_type)
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setExpandedSession(isExpanded ? null : noteKey)}
                                                className="w-full flex items-center gap-3 p-4 text-left"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">{dayName}</span>
                                                        {!session.rest_day && (
                                                            <span className="text-sm text-muted-foreground">- {session.session_type}</span>
                                                        )}
                                                        {session.rest_day && (
                                                            <span className="text-sm text-muted-foreground">- Repos</span>
                                                        )}
                                                    </div>
                                                    {!session.rest_day && (
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                            {session.duration_min && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{session.duration_min}min</span>}
                                                            {session.distance_km && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{session.distance_km}km</span>}
                                                        </div>
                                                    )}
                                                </div>
                                                {isCompleted && <span className="text-success text-sm font-medium">Fait ✓</span>}
                                                {!session.rest_day && <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
                                            </button>

                                            {isExpanded && !session.rest_day && (
                                                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                                                    <div className="bg-muted/30 p-3 rounded-xl space-y-2 text-sm">
                                                        {session.pace_target && <p><strong>Allure :</strong> {session.pace_target}</p>}
                                                        {session.workout_structure && <p><strong>Structure :</strong> {session.workout_structure}</p>}
                                                        {session.intervals && (
                                                            <p><strong>Intervalles :</strong> {session.intervals.repetitions}x {session.intervals.distance_m}m à {session.intervals.pace_target} (récup: {session.intervals.recovery})</p>
                                                        )}
                                                        {session.rpe && <p><strong>Intensité :</strong> {session.rpe}/10</p>}
                                                        {session.description && <p className="text-muted-foreground whitespace-pre-wrap">{session.description}</p>}
                                                    </div>
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <Checkbox
                                                            checked={isCompleted}
                                                            onCheckedChange={(checked) => toggleSession(selectedWeekData.week_number, dayName, checked as boolean)}
                                                        />
                                                        <span className="text-sm font-medium">{isCompleted ? 'Séance effectuée ✓' : 'Marquer comme effectuée'}</span>
                                                    </label>
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            placeholder="Notes personnelles..."
                                                            value={notes[noteKey] ?? sessionNotes}
                                                            onChange={(e) => setNotes(prev => ({ ...prev, [noteKey]: e.target.value }))}
                                                            rows={2}
                                                            className="rounded-xl"
                                                        />
                                                        {(notes[noteKey] !== undefined && notes[noteKey] !== sessionNotes) && (
                                                            <Button size="sm" onClick={() => saveNotes(selectedWeekData.week_number, dayName, notes[noteKey])} className="rounded-xl">
                                                                Sauvegarder
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tips */}
                {program.program_data.tips && program.program_data.tips.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="font-semibold mb-4">Conseils du coach</h3>
                            <ul className="space-y-3">
                                {program.program_data.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-3 text-sm">
                                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground">{tip}</span>
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
