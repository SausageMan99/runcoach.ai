'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { signupSchema, type SignupData } from '@/lib/validations/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react'

export default function SignupForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/dashboard'
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<SignupData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            acceptTerms: false,
        }
    })

    const acceptTerms = watch('acceptTerms')

    const onSubmit = async (data: SignupData) => {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()

            const { error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data.firstName || '',
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
                },
            })

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('Cet email est déjà utilisé.')
                } else {
                    setError(signUpError.message)
                }
                return
            }

            setSuccess(true)
        } catch {
            setError('Une erreur est survenue. Réessaie.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignup = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const supabase = createClient()

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
                },
            })

            if (error) {
                setError(error.message)
                setIsLoading(false)
            }
        } catch {
            setError('Une erreur est survenue. Réessaie.')
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="w-full max-w-md text-center space-y-6">
                <div className="w-20 h-20 bg-terracotta/10 rounded-3xl flex items-center justify-center mx-auto">
                    <span className="text-4xl">✉️</span>
                </div>
                <div className="space-y-2">
                    <h2 className="font-serif text-3xl">Vérifie ta boîte mail !</h2>
                    <p className="text-muted-foreground">
                        On t&apos;a envoyé un email de confirmation. Clique sur le lien pour activer ton compte.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/login')} className="rounded-2xl">
                    Retour à la connexion
                </Button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
                <h1 className="font-serif text-3xl">Crée ton compte</h1>
                <p className="text-muted-foreground">Et reçois ton programme running personnalisé</p>
            </div>

            {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-2xl border border-destructive/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom (optionnel)</Label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="firstName" type="text" placeholder="Ton prénom" className="pl-11 rounded-xl py-5" {...register('firstName')} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="ton@email.com" className="pl-11 rounded-xl py-5" {...register('email')} />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="password" type="password" placeholder="Minimum 8 caractères" className="pl-11 rounded-xl py-5" {...register('password')} />
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <Checkbox
                            id="acceptTerms"
                            checked={acceptTerms}
                            onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                        />
                        <label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                            J&apos;accepte les{' '}
                            <Link href="/terms" className="text-primary hover:underline">conditions d&apos;utilisation</Link>{' '}
                            et la{' '}
                            <Link href="/privacy" className="text-primary hover:underline">politique de confidentialité</Link>
                        </label>
                    </div>
                    {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>}
                </div>

                <Button type="submit" className="w-full rounded-2xl py-6 bg-primary text-primary-foreground font-semibold" size="lg" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Création...
                        </>
                    ) : (
                        <>
                            Créer mon compte
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-3 text-muted-foreground">Ou</span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full rounded-2xl py-6 border-border/50"
                size="lg"
                onClick={handleGoogleSignup}
                disabled={isLoading}
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuer avec Google
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Déjà un compte ?{' '}
                <Link href={`/login?redirect=${redirect}`} className="text-primary font-medium hover:underline">
                    Se connecter
                </Link>
            </p>
        </div>
    )
}
