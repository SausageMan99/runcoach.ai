# Base de données

## Vue d'ensemble

RunCoach utilise Supabase (PostgreSQL) avec Row Level Security (RLS) activé sur toutes les tables. Le schema principal est dans `supabase-schema.sql`, avec des migrations additionnelles dans `supabase/migrations/`.

## Schéma

### Table `profiles`

Étend la table `auth.users` de Supabase. Créée automatiquement via un trigger PostgreSQL lors de l'inscription.

```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

**Trigger** : `on_auth_user_created` → insère automatiquement une ligne dans `profiles` avec le `first_name` extrait des `raw_user_meta_data`.

### Table `programs`

Stocke les programmes d'entraînement générés par l'IA. Le programme complet est stocké en JSONB dans `program_data`.

```sql
CREATE TABLE programs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level              TEXT NOT NULL,
  goal               TEXT NOT NULL,
  target_date        DATE,
  sessions_per_week  INTEGER NOT NULL CHECK (sessions_per_week BETWEEN 2 AND 7),
  reference_time     TEXT,
  injuries_notes     TEXT,
  race_id            UUID REFERENCES races(id),
  program_data       JSONB NOT NULL,
  is_active          BOOLEAN DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT now()
);
```

**Flag `is_active`** : Un seul programme actif par utilisateur. Lors de la création d'un nouveau programme, les anciens sont désactivés.

### Table `session_tracking`

Suivi de la complétion des séances individuelles.

```sql
CREATE TABLE session_tracking (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number   INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 52),
  session_day   TEXT NOT NULL,
  completed     BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id, week_number, session_day)
);
```

**Contrainte UNIQUE** : Empêche les doublons pour une même séance. L'API utilise `upsert` pour créer ou mettre à jour.

### Table `daily_check_ins`

Check-ins quotidiens de fatigue avec ajustements adaptatifs.

```sql
CREATE TABLE daily_check_ins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id       UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  session_id       TEXT,
  feeling          INTEGER NOT NULL CHECK (feeling BETWEEN 1 AND 3),
  adjustment_made  JSONB,
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

**Valeurs feeling** :
- `1` = En forme
- `2` = Fatigué
- `3` = Très fatigué

**`adjustment_made`** (JSONB) : Stocke les détails de l'ajustement appliqué (type original, type ajusté, réduction d'intensité, message).

### Table `races`

Catalogue de courses françaises (50+ courses pré-remplies).

```sql
CREATE TABLE races (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  city              TEXT NOT NULL,
  country           TEXT NOT NULL DEFAULT 'France',
  date              DATE NOT NULL,
  distance_km       NUMERIC NOT NULL,
  elevation_gain_m  INTEGER DEFAULT 0,
  elevation_loss_m  INTEGER DEFAULT 0,
  terrain_type      TEXT DEFAULT 'route',   -- route/trail/mixte
  difficulty        TEXT DEFAULT 'moyen',   -- facile/moyen/difficile/expert
  key_points        TEXT[],
  typical_weather   TEXT,
  website_url       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);
```

## Migrations

Les migrations dans `supabase/migrations/` :

| Fichier | Description |
|---------|-------------|
| `001_daily_checkins.sql` | Création table `daily_check_ins` |
| `002_races.sql` | Création table `races`, ajout `race_id` à `programs` |
| `003_seed_french_races.sql` | Données initiales : 50+ courses françaises |
| `004_more_races.sql` | Courses additionnelles |
| `005_fix_rls_performance.sql` | Optimisation des policies RLS |

## Row Level Security (RLS)

Chaque table a des policies restrictives :

```sql
-- Exemple pour programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own programs"
  ON programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own programs"
  ON programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs"
  ON programs FOR UPDATE
  USING (auth.uid() = user_id);
```

La table `races` est en lecture publique (pas de données sensibles).

## Relations

```
auth.users
    │
    ├── 1:1 ── profiles
    │
    ├── 1:N ── programs
    │              │
    │              ├── 1:N ── session_tracking
    │              │
    │              ├── 1:N ── daily_check_ins
    │              │
    │              └── N:1 ── races (optionnel)
    │
    ├── 1:N ── session_tracking
    │
    └── 1:N ── daily_check_ins
```

## Requêtes courantes

### Récupérer le programme actif

```typescript
const { data } = await supabase
  .from('programs')
  .select('*')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .single();
```

### Marquer une séance comme complétée

```typescript
await supabase
  .from('session_tracking')
  .upsert({
    program_id,
    user_id,
    week_number,
    session_day,
    completed: true,
    completed_at: new Date().toISOString(),
    notes
  });
```

### Récupérer les check-ins récents

```typescript
const { data } = await supabase
  .from('daily_check_ins')
  .select('*')
  .eq('user_id', user.id)
  .eq('program_id', programId)
  .order('date', { ascending: false })
  .limit(7);
```
