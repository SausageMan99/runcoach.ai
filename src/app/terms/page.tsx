import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-3xl px-4 py-12">
                <Link href="/">
                    <Button variant="ghost" className="mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à l&apos;accueil
                    </Button>
                </Link>

                <h1 className="text-4xl font-bold mb-8">Conditions Générales d&apos;Utilisation</h1>

                <div className="prose prose-zinc max-w-none space-y-6">
                    <p className="text-muted-foreground">
                        Dernière mise à jour : Février 2024
                    </p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">1. Objet</h2>
                        <p>
                            Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet de définir
                            les modalités d&apos;utilisation du service RunCoach.AI, une application web de
                            coaching running personnalisé par intelligence artificielle.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">2. Description du Service</h2>
                        <p>
                            RunCoach.AI propose la génération de programmes d&apos;entraînement running personnalisés
                            basés sur les informations fournies par l&apos;utilisateur (niveau, objectif, disponibilité).
                        </p>
                        <p>
                            Les programmes sont générés par intelligence artificielle et sont fournis à titre
                            informatif uniquement. Ils ne constituent pas un avis médical.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">3. Accès au Service</h2>
                        <p>
                            L&apos;accès au service nécessite la création d&apos;un compte. L&apos;utilisateur s&apos;engage
                            à fournir des informations exactes et à maintenir la confidentialité de ses
                            identifiants de connexion.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">4. Responsabilité</h2>
                        <p>
                            L&apos;utilisateur reconnaît que la pratique sportive comporte des risques.
                            Il est recommandé de consulter un médecin avant de commencer tout programme
                            d&apos;entraînement, notamment en cas de problèmes de santé préexistants.
                        </p>
                        <p>
                            RunCoach.AI ne saurait être tenu responsable des dommages directs ou indirects
                            résultant de l&apos;utilisation du service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">5. Propriété Intellectuelle</h2>
                        <p>
                            L&apos;ensemble du contenu du site (textes, images, code) est protégé par le droit
                            d&apos;auteur. Toute reproduction non autorisée est interdite.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">6. Modification des CGU</h2>
                        <p>
                            RunCoach.AI se réserve le droit de modifier les présentes CGU à tout moment.
                            Les utilisateurs seront informés des modifications par email ou notification
                            sur le site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold">7. Contact</h2>
                        <p>
                            Pour toute question concernant ces CGU, vous pouvez nous contacter à :
                            contact@runcoach.ai
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
