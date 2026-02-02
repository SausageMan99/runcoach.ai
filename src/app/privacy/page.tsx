import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-3xl px-4 py-12">
                <Link href="/">
                    <Button variant="ghost" className="mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à l&apos;accueil
                    </Button>
                </Link>

                <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>

                <div className="prose prose-zinc max-w-none space-y-6">
                    <p className="text-muted-foreground">
                        Dernière mise à jour : Février 2024
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">1. Introduction</h2>
                        <p>
                            RunCoach.AI s&apos;engage à protéger la vie privée de ses utilisateurs.
                            Cette politique explique comment nous collectons, utilisons et protégeons
                            vos données personnelles.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">2. Données Collectées</h2>
                        <p>Nous collectons les données suivantes :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Données de compte</strong> : email, prénom (optionnel)</li>
                            <li><strong>Profil running</strong> : niveau, objectif, disponibilité, temps de référence, notes sur blessures</li>
                            <li><strong>Données d&apos;usage</strong> : séances effectuées, notes personnelles</li>
                            <li><strong>Données techniques</strong> : logs de connexion, adresse IP</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">3. Utilisation des Données</h2>
                        <p>Vos données sont utilisées pour :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Générer votre programme d&apos;entraînement personnalisé</li>
                            <li>Vous permettre de suivre votre progression</li>
                            <li>Améliorer notre service</li>
                            <li>Vous envoyer des notifications liées au service</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">4. Partage des Données</h2>
                        <p>
                            Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Supabase</strong> : hébergement de la base de données (serveurs EU)</li>
                            <li><strong>Anthropic (Claude AI)</strong> : génération des programmes (données anonymisées)</li>
                            <li><strong>Vercel</strong> : hébergement de l&apos;application</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">5. Sécurité</h2>
                        <p>
                            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger
                            vos données : chiffrement en transit (HTTPS), contrôle d&apos;accès (Row Level Security),
                            authentification sécurisée.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">6. Vos Droits (RGPD)</h2>
                        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Accès</strong> : consulter vos données</li>
                            <li><strong>Rectification</strong> : corriger vos données</li>
                            <li><strong>Suppression</strong> : supprimer votre compte et toutes vos données</li>
                            <li><strong>Portabilité</strong> : exporter vos données</li>
                        </ul>
                        <p>
                            Pour exercer ces droits, utilisez la page Paramètres ou contactez-nous.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">7. Cookies</h2>
                        <p>
                            Nous utilisons uniquement des cookies essentiels au fonctionnement du service
                            (authentification). Aucun cookie publicitaire ou de tracking n&apos;est utilisé.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">8. Conservation des Données</h2>
                        <p>
                            Vos données sont conservées tant que votre compte est actif.
                            En cas de suppression de compte, toutes vos données sont immédiatement supprimées.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">9. Contact</h2>
                        <p>
                            Pour toute question concernant vos données personnelles :
                            privacy@runcoach.ai
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
