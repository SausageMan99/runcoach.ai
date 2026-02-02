# RunCoach.AI MVP 🏃

Application web de coaching running personnalisé par IA. Génère un programme d'entraînement sur-mesure en 2 minutes basé sur le niveau, l'objectif et les disponibilités du runner.

![RunCoach.AI](./public/screenshot.png)

## ✨ Features

- **Onboarding en 6 questions** - Profil complet en moins de 2 minutes
- **Génération IA** - Programme 12 semaines personnalisé via Claude API
- **Dashboard** - Vue d'ensemble avec stats et calendrier semaine
- **Suivi séances** - Marquer les séances comme effectuées
- **Notes personnelles** - Ajouter des commentaires par séance
- **Responsive** - Mobile-first, fonctionne sur tous écrans

## 🚀 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Hosting**: Vercel

## 📦 Installation

### Prérequis

- Node.js 18+
- Compte [Supabase](https://supabase.com)
- Clé API [Anthropic](https://console.anthropic.com)

### 1. Cloner le repo

```bash
git clone https://github.com/your-username/runcoach-mvp.git
cd runcoach-mvp
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir les variables dans `.env.local`:

```env
# Supabase (depuis le dashboard Supabase > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Claude API (depuis console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configurer la base de données

1. Créer un projet Supabase sur [supabase.com](https://supabase.com)
2. Aller dans SQL Editor
3. Copier-coller le contenu de `supabase-schema.sql`
4. Exécuter le script

### 5. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
runcoach-mvp/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── page.tsx            # Landing page
│   │   ├── (auth)/             # Pages authentification
│   │   ├── onboarding/         # Formulaire 6 questions
│   │   ├── generate/           # Page génération IA
│   │   ├── (dashboard)/        # Dashboard protégé
│   │   └── api/                # API Routes
│   ├── components/
│   │   └── ui/                 # Composants Shadcn
│   ├── lib/
│   │   ├── supabase/           # Clients Supabase
│   │   ├── ai/                 # Claude API wrapper
│   │   └── validations/        # Schemas Zod
│   └── types/                  # Types TypeScript
├── supabase-schema.sql         # Schema base de données
└── .env.example                # Template variables env
```

## 🔐 Authentification

L'application utilise Supabase Auth avec:
- Email/Password
- Google OAuth (à configurer dans Supabase Dashboard)

## 📊 Base de Données

3 tables principales:
- `profiles` - Étend auth.users
- `programs` - Programmes générés (JSONB)
- `session_tracking` - Suivi des séances

Row Level Security (RLS) activé - chaque utilisateur accède uniquement à ses données.

## 🤖 Génération IA

Le programme est généré par Claude 3.5 Sonnet avec:
- Méthode scientifique Jack Daniels (VDOT)
- Progression graduelle (+10% vol/semaine max)
- Variation des séances (endurance, fractionné, sortie longue)
- Phases de récupération et affûtage
- Rate limit: 1 génération/jour/utilisateur

## 🚢 Déploiement

### Vercel (recommandé)

1. Push sur GitHub
2. Importer le projet sur [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement
4. Déployer

```bash
# Ou via CLI
npm i -g vercel
vercel --prod
```

### Variables d'environnement (production)

Dans le dashboard Vercel, ajouter:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SITE_URL` (URL de prod)

## 📝 Scripts

```bash
npm run dev      # Serveur développement
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
```

## 🔧 Configuration Supabase

### Google OAuth (optionnel)

1. Supabase Dashboard > Authentication > Providers
2. Activer Google
3. Configurer les credentials Google Cloud Console
4. Ajouter les redirect URLs

### Email Templates (optionnel)

1. Dashboard > Authentication > Email Templates
2. Personnaliser les emails de confirmation

## 📈 Métriques MVP

Objectifs à atteindre:
- 30%+ complétion onboarding
- 50%+ retour semaine 2+
- 20%+ trackent 3+ séances
- NPS > 40

## 🐛 Troubleshooting

### Erreur "Non authentifié" sur /generate
- Vérifier que l'utilisateur est bien connecté
- Vérifier les cookies Supabase

### Programme non généré
- Vérifier la clé API Anthropic
- Regarder les logs dans la console

### RLS errors
- Vérifier que le schema SQL est bien exécuté
- Vérifier que les policies sont actives

## 📄 License

MIT

---

Fait avec ❤️ pour les runners
