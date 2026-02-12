'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Target, LogOut, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Program } from '@/types'

interface SettingsClientProps {
    email: string
    firstName: string
    program: Program | null
}

export default function SettingsClient({ email, firstName: initialFirstName, program }: SettingsClientProps) {
    const router = useRouter()
    const [firstName, setFirstName] = useState(initialFirstName)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).single()
                if (existing) {
                    await supabase.from('profiles').update({ first_name: firstName, updated_at: new Date().toISOString() }).eq('id', user.id)
                } else {
                    await supabase.from('profiles').insert({ id: user.id, first_name: firstName })
                }
                toast.success('Profil sauvegardé !')
            }
        } catch {
            toast.error('Impossible de sauvegarder le profil')
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('profiles').delete().eq('id', user.id)
                await supabase.auth.signOut()
                router.push('/')
                router.refresh()
            }
        } catch {
            toast.error('Impossible de supprimer le compte')
            setIsDeleting(false)
        }
    }

    const handleRegenerateProgram = () => {
        setRegenerateDialogOpen(false)
        router.push('/onboarding')
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="space-y-1">
                    <h1 className="font-serif text-3xl">Paramètres</h1>
                    <p className="text-muted-foreground">Gère ton profil et tes préférences</p>
                </div>

                {/* Profile */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold">Mon Profil</h3>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ton prénom" className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={email} disabled className="bg-muted/50 rounded-xl" />
                            <p className="text-xs text-muted-foreground">L&apos;email ne peut pas être modifié</p>
                        </div>
                        <Button onClick={handleSaveProfile} disabled={isSaving} className="rounded-xl">
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sauvegarde...</>
                            ) : (
                                'Sauvegarder'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Program */}
                {program && (
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="font-semibold">Mon Programme</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div className="bg-muted/30 p-4 rounded-xl">
                                    <p className="text-xs text-muted-foreground">Objectif</p>
                                    <p className="font-medium">{program.goal}</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl">
                                    <p className="text-xs text-muted-foreground">Niveau</p>
                                    <p className="font-medium capitalize">{program.level}</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl">
                                    <p className="text-xs text-muted-foreground">Séances/semaine</p>
                                    <p className="font-medium">{program.sessions_per_week}</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl">
                                    <p className="text-xs text-muted-foreground">Date objectif</p>
                                    <p className="font-medium">
                                        {program.target_date ? new Date(program.target_date).toLocaleDateString('fr-FR') : 'Non définie'}
                                    </p>
                                </div>
                            </div>
                            <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full rounded-xl border-border/50">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Générer un nouveau programme
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Générer un nouveau programme ?</DialogTitle>
                                        <DialogDescription>
                                            Tu vas recommencer le questionnaire. Ton programme actuel sera désactivé (mais pas supprimé).
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button variant="outline" onClick={() => setRegenerateDialogOpen(false)} className="rounded-xl">Annuler</Button>
                                        <Button onClick={handleRegenerateProgram} className="rounded-xl">Oui, recommencer</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}

                {/* Account actions */}
                <Card>
                    <CardContent className="pt-6 space-y-3">
                        <h3 className="font-semibold mb-2">Actions du compte</h3>
                        <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl border-border/50">
                            <LogOut className="w-4 h-4 mr-2" />
                            Se déconnecter
                        </Button>
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer mon compte
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-2xl">
                                <DialogHeader>
                                    <DialogTitle>Supprimer ton compte ?</DialogTitle>
                                    <DialogDescription>
                                        Cette action est irréversible. Toutes tes données seront définitivement supprimées.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl">Annuler</Button>
                                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting} className="rounded-xl">
                                        {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Suppression...</> : 'Oui, supprimer'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
