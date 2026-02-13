'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import type { InjuryRiskResult } from '@/lib/utils/injury-risk'

interface InjuryRiskWidgetProps {
    risk: InjuryRiskResult
}

const levelConfig = {
    low: { label: 'Faible', color: 'text-terracotta', bg: 'bg-terracotta', border: 'border-terracotta/20', bgLight: 'bg-terracotta/5', badgeBg: 'bg-terracotta/10' },
    medium: { label: 'Modéré', color: 'text-warning', bg: 'bg-warning', border: 'border-warning/20', bgLight: 'bg-warning/5', badgeBg: 'bg-warning/10' },
    high: { label: 'Élevé', color: 'text-destructive', bg: 'bg-destructive', border: 'border-destructive/20', bgLight: 'bg-destructive/5', badgeBg: 'bg-destructive/10' },
}

export default function InjuryRiskWidget({ risk }: InjuryRiskWidgetProps) {
    const config = levelConfig[risk.level]

    return (
        <Card className={`${config.border} ${config.bgLight}`}>
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${config.badgeBg} flex items-center justify-center`}>
                            <ShieldAlert className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <h3 className="font-semibold">Risque Blessure</h3>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${config.badgeBg} ${config.color}`}>
                        {config.label}
                    </span>
                </div>

                {/* Score bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Score global</span>
                        <span className={`font-bold ${config.color}`}>{risk.score}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full ${config.bg} rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${risk.score}%` }}
                        />
                    </div>
                </div>

                {/* Factors */}
                <div className="space-y-2">
                    {risk.factors.filter(f => f.score > 0).map((factor) => (
                        <div key={factor.name} className="flex items-center gap-2 text-sm">
                            <span>{factor.icon}</span>
                            <span className="flex-1 text-muted-foreground">{factor.name}</span>
                            <span className="font-medium">{factor.score}/{factor.maxScore}</span>
                        </div>
                    ))}
                </div>

                {/* Recommendations */}
                {risk.recommendations.length > 0 && (
                    <div className="pt-3 border-t border-border/50 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recommandations</p>
                        {risk.recommendations.map((rec, i) => (
                            <p key={i} className="text-sm flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="text-muted-foreground">{rec}</span>
                            </p>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
