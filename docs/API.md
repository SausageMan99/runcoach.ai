# API Routes

## Vue d'ensemble

Toutes les routes API sont dans `src/app/api/`. Elles utilisent les Route Handlers de Next.js 16.

## Routes

### `POST /api/generate-program`

Génère un programme d'entraînement complet et le sauvegarde en base.

**Auth** : Requise (Supabase session)
**Rate limit** : 1 par jour par utilisateur

**Body** :
```json
{
  "level": "débutant",
  "goal": "semi-marathon",
  "target_date": "2025-09-15",
  "sessions_per_week": 4,
  "reference_time": "2h05",
  "injuries_notes": "Douleur genou droit occasionnelle",
  "race_id": "uuid-optionnel"
}
```

**Réponse (200)** :
```json
{
  "program": { /* ProgramData complet */ },
  "programId": "uuid"
}
```

**Erreurs** :
- `401` : Non authentifié
- `429` : Rate limit (déjà généré aujourd'hui)
- `500` : Erreur génération IA

---

### `POST /api/generate-program-preview`

Génère un programme preview sans authentification (flow onboarding).

**Auth** : Non requise
**Rate limit** : 3 par jour par IP (`x-forwarded-for`)

**Body** : Identique à `/api/generate-program`

**Réponse (200)** :
```json
{
  "program": { /* ProgramData complet */ }
}
```

**Note** : Le programme n'est PAS sauvegardé en base. Il est stocké côté client (localStorage) jusqu'à l'inscription.

---

### `POST /api/save-program`

Sauvegarde un programme preview en base après inscription.

**Auth** : Requise

**Body** :
```json
{
  "level": "intermédiaire",
  "goal": "marathon",
  "target_date": "2025-11-10",
  "sessions_per_week": 5,
  "reference_time": "1h45",
  "injuries_notes": null,
  "race_id": null,
  "program_data": { /* ProgramData */ }
}
```

**Réponse (200)** :
```json
{
  "programId": "uuid"
}
```

---

### `POST /api/tracking`

Marque une séance comme complétée ou non complétée.

**Auth** : Requise

**Body** :
```json
{
  "program_id": "uuid",
  "week_number": 3,
  "session_day": "Mardi",
  "completed": true,
  "notes": "Bonne séance, allure confortable"
}
```

**Réponse (200)** :
```json
{
  "tracking": { /* SessionTracking */ }
}
```

**Comportement** : Utilise `upsert` — crée l'entrée si elle n'existe pas, met à jour sinon (contrainte UNIQUE sur `program_id` + `week_number` + `session_day`).

---

### `POST /api/daily-check-in`

Soumet un check-in de fatigue quotidien et retourne l'ajustement recommandé.

**Auth** : Requise
**Rate limit** : 1 par jour par utilisateur

**Body** :
```json
{
  "program_id": "uuid",
  "session_id": "week3-mardi",
  "feeling": 2
}
```

**Réponse (200)** :
```json
{
  "checkIn": {
    "id": "uuid",
    "feeling": 2,
    "adjustment_made": {
      "original_type": "Fractionné",
      "adjusted_type": "Endurance fondamentale",
      "intensity_reduction": 10,
      "message": "Séance adaptée : endurance légère au lieu du fractionné."
    },
    "date": "2025-06-15"
  }
}
```

---

### `GET /api/stats/testers`

Retourne des statistiques anonymisées pour les beta testeurs.

**Auth** : Non requise

**Réponse (200)** :
```json
{
  "total_users": 42,
  "total_programs": 38,
  "total_sessions_tracked": 156
}
```

---

### `GET /auth/callback`

Gère le callback OAuth (Google). Échange le code d'autorisation contre une session Supabase et redirige vers `/dashboard`.

**Auth** : Non requise (c'est le flow d'auth)

## Patterns communs

### Vérification d'authentification

```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json(
    { error: 'Non authentifié' },
    { status: 401 }
  );
}
```

### Gestion d'erreurs

Toutes les routes retournent un format d'erreur cohérent :

```json
{
  "error": "Message d'erreur lisible"
}
```

### Rate limiting

Vérifié en base de données (pas de système externe) :

```typescript
// Vérifier si génération aujourd'hui
const { data: existing } = await supabase
  .from('programs')
  .select('id')
  .eq('user_id', user.id)
  .gte('created_at', todayStart)
  .limit(1);

if (existing && existing.length > 0) {
  return NextResponse.json(
    { error: 'Limite atteinte' },
    { status: 429 }
  );
}
```
