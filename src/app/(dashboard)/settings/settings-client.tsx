'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings, User, Target, LogOut, Trash2, RefreshCw, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false)

    const handleSaveProfile = async () => {
        setIsSaving(true)
        setSaveSuccess(false)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Check if profile exists
                const { data: existing } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                if (existing) {
                    await supabase
                        .from('profiles')
                        .update({ first_name: firstName, updated_at: new Date().toISOString() })
                        .eq('id', user.id)
                } else {
                    await supabase
                        .from('profiles')
                        .insert({ id: user.id, first_name: firstName })
                }

                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
            }
        } catch (error) {
            console.error('Error saving profile:', error)
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
                // Delete user data (cascade will handle programs and tracking)
                await supabase.from('profiles').delete().eq('id', user.id)

                // Sign out
                await supabase.auth.signOut()

                router.push('/')
                router.refresh()
            }
        } catch (error) {
            console.error('Error deleting account:', error)
            setIsDeleting(false)
        }
    }

    const handleRegenerateProgram = () => {
        setRegenerateDialogOpen(false)
        router.push('/onboarding')
    }

    return (
        <div className="p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Settings className="w-8 h-8 text-primary" />
                        Paramètres
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Gère ton profil et tes préférences
                    </p>
                </div>

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Mon Profil
                        </CardTitle>
                        <CardDescription>
                            Informations personnelles
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Ton prénom"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={email}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                L&apos;email ne peut pas être modifié
                            </p>
                        </div>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="w-full sm:w-auto"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sauvegarde...
                                </>
                            ) : saveSuccess ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Sauvegardé !
                                </>
                            ) : (
                                'Sauvegarder'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Program Section */}
                {program && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5" />
                                Mon Programme
                            </CardTitle>
                            <CardDescription>
                                Informations sur ton programme actuel
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Objectif</p>
                                    <p className="font-semibold">{program.goal}</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Niveau</p>
                                    <p className="font-semibold capitalize">{program.level}</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Séances/semaine</p>
                                    <p className="font-semibold">{program.sessions_per_week}</p>
                                </div>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Date objectif</p>
                                    <p className="font-semibold">
                                        {program.target_date
                                            ? new Date(program.target_date).toLocaleDateString('fr-FR')
                                            : 'Non définie'}
                                    </p>
                                </div>
                            </div>

                            <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Générer un nouveau programme
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Générer un nouveau programme ?</DialogTitle>
                                        <DialogDescription>
                                            Tu vas recommencer le questionnaire et générer un nouveau programme.
                                            Ton programme actuel sera désactivé (mais pas supprimé).
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="gap-2 sm:gap-0">
                                        <Button variant="outline" onClick={() => setRegenerateDialogOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button onClick={handleRegenerateProgram}>
                                            Oui, recommencer
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}

                {/* Account Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions du compte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" onClick={handleLogout} className="w-full">
                            <LogOut className="w-4 h-4 mr-2" />
                            Se déconnecter
                        </Button>

                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer mon compte
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Supprimer ton compte ?</DialogTitle>
                                    <DialogDescription>
                                        Cette action est irréversible. Toutes tes données (profil, programmes, suivi) seront définitivement supprimées.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Suppression...
                                            </>
                                        ) : (
                                            'Oui, supprimer'
                                        )}
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
