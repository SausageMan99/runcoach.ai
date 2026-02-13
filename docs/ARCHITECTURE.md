# Architecture technique

## Vue d'ensemble

RunCoach MVP est une application Next.js 16 (App Router) avec TypeScript strict, utilisant Supabase pour l'authentification et la base de données, et l'API Claude d'Anthropic pour la génération de programmes d'entraînement.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Client    │────▶│  Next.js 16  │────▶│  Supabase       │
│  (React 19) │◀────│  App Router  │◀────│  PostgreSQL+RLS │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Claude API  │
                    │  (Anthropic) │
                    └──────────────┘
```

## Patterns architecturaux

### Server/Client split

Chaque page protégée suit le pattern :

```
page.tsx (Server Component)
  └── Fetch données via Supabase server client
  └── Passe les données au client component
        └── *-client.tsx (Client Component)
            └── Interactivité, state, mutations
```

**Exemple :** `dashboard/page.tsx` récupère le programme actif et le passe à `dashboard-client.tsx`.

### Route groups

- `(auth)/` — Pages login/signup avec layout partagé (non protégé, redirect si connecté)
- `(dashboard)/` — Pages protégées avec layout partagé (sidebar, navigation)

### API Routes

Toutes dans `src/app/api/`. Chaque route :
1. Vérifie l'authentification (sauf `generate-program-preview`)
2. Valide les données entrantes
3. Interagit avec Supabase ou Claude API
4. Retourne une réponse JSON typée

## Flux de données

### Génération de programme

```
Onboarding (localStorage)
    │
    ▼
POST /api/generate-program-preview
    │
    ├── Calcul nombre de semaines
    ├── Récupération contexte course (si applicable)
    ├── Construction du prompt
    ├── Appel Claude API (Haiku ou Sonnet selon durée)
    ├── Parsing + validation JSON
    ├── Retry si erreur (bascule Sonnet)
    │
    ▼
Programme JSON retourné au client
    │
    ▼
POST /api/save-program (après inscription)
    │
    ▼
Stocké en JSONB dans table `programs`
```

### Suivi des séances

```
Client: toggle checkbox séance
    │
    ▼
POST /api/tracking
    │
    ├── Upsert dans session_tracking
    │   (UNIQUE: program_id + week_number + session_day)
    │
    ▼
Mise à jour UI optimiste
```

### Daily check-in

```
Client: sélection ressenti (1/2/3)
    │
    ▼
POST /api/daily-check-in
    │
    ├── Vérifie pas de check-in aujourd'hui
    ├── Récupère check-ins récents
    ├── Calcule ajustement:
    │   ├── feeling=1: aucun
    │   ├── feeling=2: -10% intensité
    │   └── feeling=3 ou 2+ fatigué: repos forcé
    ├── Insert dans daily_check_ins
    │
    ▼
Ajustement retourné au client
```

## Sécurité

### Row Level Security (RLS)

Toutes les tables ont RLS activé. Policies :
- `SELECT` : `auth.uid() = user_id`
- `INSERT` : `auth.uid() = user_id`
- `UPDATE` : `auth.uid() = user_id`

Aucun utilisateur ne peut accéder aux données d'un autre.

### Middleware

`src/middleware.ts` intercepte chaque requête :
- Routes protégées → redirect `/login` si non authentifié
- Routes auth → redirect `/dashboard` si déjà connecté
- Refresh automatique des cookies de session

### Rate limiting

- `/api/generate-program` : 1 génération par jour par utilisateur (vérifié en DB)
- `/api/generate-program-preview` : 3 par jour par IP (vérifié via header `x-forwarded-for`)
- `/api/daily-check-in` : 1 par jour par utilisateur

### Variables d'environnement

- `NEXT_PUBLIC_*` : Exposées au client (URL Supabase, anon key)
- `SUPABASE_SERVICE_ROLE_KEY` : Server-only, accès admin
- `ANTHROPIC_API_KEY` : Server-only

## Performance

- **Server Components** par défaut (réduction du JS client)
- **Vercel Analytics** pour le suivi des performances
- **Vercel Speed Insights** pour les Core Web Vitals
- **Lazy loading** des composants lourds (Framer Motion)
- **Optimistic UI** pour le suivi des séances
