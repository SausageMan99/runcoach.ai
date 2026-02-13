# RunCoach MVP

Application web de coaching running personnalisé par IA. Génère un programme d'entraînement sur-mesure basé sur la méthodologie Jack Daniels (VDOT), adapté au niveau, à l'objectif et aux disponibilités du runner.

## Features

- **Onboarding intelligent** — Questionnaire en 7 étapes avec sélection de course parmi 50+ courses françaises
- **Génération IA adaptative** — Programme personnalisé via Claude API (Haiku 3.5 / Sonnet 4.5 selon la durée)
- **Dashboard interactif** — Stats, calendrier semaine, countdown course, score de risque blessure
- **Daily check-in** — Auto-adaptation des séances selon la fatigue (intensité réduite ou repos forcé)
- **Suivi des séances** — Marquage complet avec notes personnelles
- **Score de risque blessure** — Calcul temps réel basé sur volume, intensité, fatigue et repos
- **Entraînement spécifique course** — Adaptation trail, ultra, chaleur, dénivelé
- **Responsive** — Mobile-first

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + Shadcn/ui (New York) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| AI | Claude 3.5 Haiku / Sonnet 4.5 (Anthropic) |
| Validation | Zod + React Hook Form |
| Animations | Framer Motion |
| Analytics | Vercel Analytics + Speed Insights |
| Hosting | Vercel |

## Installation

### Prérequis

- Node.js 18+
- Compte [Supabase](https://supabase.com)
- Clé API [Anthropic](https://console.anthropic.com)

### Setup

```bash
# 1. Cloner le repo
git clone https://github.com/your-username/runcoach-mvp.git
cd runcoach-mvp

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
```

Remplir `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Base de données

1. Créer un projet sur [supabase.com](https://supabase.com)
2. SQL Editor → exécuter `supabase-schema.sql`
3. Exécuter les migrations dans `supabase/migrations/` (dans l'ordre)

### Lancer le serveur

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # Serveur développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
```

## Structure du projet

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── (auth)/                         # Route group auth
│   │   ├── login/                      # Connexion
│   │   └── signup/                     # Inscription
│   ├── onboarding/page.tsx             # Questionnaire 7 étapes
│   ├── generate/page.tsx               # Écran de génération
│   ├── (dashboard)/                    # Route group protégé
│   │   ├── dashboard/                  # Vue d'ensemble
│   │   ├── program/                    # Programme détaillé
│   │   └── settings/                   # Paramètres
│   ├── api/
│   │   ├── generate-program/           # Génération auth (1/jour/user)
│   │   ├── generate-program-preview/   # Preview sans auth (3/jour/IP)
│   │   ├── save-program/              # Sauvegarde post-inscription
│   │   ├── tracking/                  # Suivi des séances
│   │   └── daily-check-in/            # Check-in fatigue
│   └── auth/callback/                 # OAuth callback
├── components/
│   ├── ui/                            # Shadcn/ui
│   ├── dashboard/                     # Widgets dashboard
│   ├── onboarding/                    # Composants onboarding
│   └── landing/                       # Composants landing
├── lib/
│   ├── ai/
│   │   ├── claude.ts                  # Client Claude API
│   │   └── prompts.ts                 # Templates de prompts
│   ├── supabase/
│   │   ├── client.ts                  # Client navigateur
│   │   ├── server.ts                  # Client serveur
│   │   └── middleware.ts              # Helpers middleware
│   ├── validations/schemas.ts         # Schemas Zod
│   └── utils/injury-risk.ts          # Calcul risque blessure
├── types/index.ts                     # Interfaces TypeScript
└── middleware.ts                      # Protection des routes
```

## Parcours utilisateur

```
Landing (/) ──→ Onboarding (/onboarding)
                    │
                    ├─ Step 1: Niveau (débutant/intermédiaire/avancé)
                    ├─ Step 2: Objectif (5K, 10K, semi, marathon, amélioration)
                    ├─ Step 3: Course cible (50+ courses FR ou personnalisée)
                    ├─ Step 4: Date cible
                    ├─ Step 5: Séances par semaine (2-7)
                    ├─ Step 6: Temps de référence
                    └─ Step 7: Blessures / précautions
                    │
                    ▼
            Génération IA (preview)
                    │
                    ▼
            Aperçu du programme
                    │
                    ▼
            Inscription (inline)
                    │
                    ▼
            Dashboard (/dashboard)
                ├── Vue semaine + stats
                ├── Daily check-in (adaptation fatigue)
                ├── Score risque blessure
                └── Countdown course
```

## Architecture technique

### Authentification

Supabase Auth avec middleware Next.js. Les routes `/dashboard`, `/program`, `/settings` sont protégées (redirect vers `/login`). Les pages auth redirigent les utilisateurs connectés vers `/dashboard`.

- **Server components** : `createClient()` depuis `@/lib/supabase/server`
- **Client components** : `createBrowserClient()` depuis `@/lib/supabase/client`

### Base de données

5 tables avec Row Level Security (RLS) :

| Table | Rôle |
|-------|------|
| `profiles` | Étend auth.users (prénom). Auto-créé via trigger. |
| `programs` | Programmes IA en JSONB (`program_data`). Flag `is_active`. |
| `session_tracking` | Complétion des séances avec notes. |
| `daily_check_ins` | Check-ins fatigue avec ajustements adaptatifs (JSONB). |
| `races` | 50+ courses françaises (distance, dénivelé, terrain, météo). |

### Génération IA

**Sélection dynamique du modèle :**
- Haiku 3.5 pour les programmes de 10 semaines ou moins (8000 tokens max)
- Sonnet 4.5 pour les programmes de plus de 10 semaines (16384 tokens max)

**Méthodologie :**
- Jack Daniels VDOT
- Ratio 85/15 endurance/intensité (débutants)
- Progression +8-10%/semaine max
- Semaines de récupération toutes les 3 semaines
- Adaptations spécifiques : trail (dénivelé, proprioception), ultra (back-to-back), chaleur (acclimatation)

**Validation :**
- Parsing JSON strict
- Vérification du nombre de semaines et de séances
- Retry automatique sur erreur de parsing (bascule vers Sonnet)

### Daily check-in adaptatif

| Ressenti | Action |
|----------|--------|
| En forme | Pas d'ajustement |
| Fatigué | -10% intensité, allures ajustées |
| Très fatigué / 2+ jours fatigué consécutifs | Repos forcé |

Le fractionné est converti en endurance fondamentale quand l'utilisateur est fatigué.

### Score de risque blessure

Calcul temps réel (0-100) basé sur :
- Spike de volume hebdomadaire (0-30 pts)
- Ratio d'intensité (0-20 pts)
- Niveau de fatigue moyen (0-25 pts)
- Absence de renforcement musculaire (0-5 pts)
- Jours de repos insuffisants (0-10 pts)

## Design

- **Langue** : Français
- **Style** : Inspiré Keith Haring, bordures hand-drawn, boutons 3D artistiques
- **Palette** : Crème chaud `#F5F0E6`, noir bold `#1A1A1A`
- **Polices** : Inter (sans-serif), Lora (serif)
- **Composants** : Shadcn/ui (style New York) sur Radix UI

## Déploiement (Vercel)

1. Push sur GitHub
2. Importer le projet sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement (voir `.env.example`)
4. Déployer

```bash
# Ou via CLI
npm i -g vercel
vercel --prod
```

## Configuration Supabase

### Google OAuth (optionnel)

1. Supabase Dashboard > Authentication > Providers > Google
2. Configurer les credentials Google Cloud Console
3. Ajouter les redirect URLs

### Email Templates (optionnel)

Dashboard > Authentication > Email Templates pour personnaliser les emails de confirmation.

## Troubleshooting

| Problème | Solution |
|----------|----------|
| "Non authentifié" sur /generate | Vérifier les cookies Supabase et la session |
| Programme non généré | Vérifier `ANTHROPIC_API_KEY` et les logs serveur |
| Erreurs RLS | Vérifier que le schema SQL et les migrations sont exécutés |
| Rate limit atteint | 1 génération/jour/user (auth) ou 3/jour/IP (preview) |

## License

MIT

---

Fait avec soin pour les runners.
