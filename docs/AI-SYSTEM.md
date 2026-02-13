# Système IA — Génération de programmes

## Vue d'ensemble

Le moteur IA de RunCoach génère des programmes d'entraînement personnalisés en utilisant l'API Claude d'Anthropic. La génération est basée sur la méthodologie Jack Daniels (VDOT), une référence scientifique dans le coaching running.

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/lib/ai/claude.ts` | Client Claude API, logique de génération |
| `src/lib/ai/prompts.ts` | Templates de prompts système |
| `src/app/api/generate-program/route.ts` | Route API authentifiée |
| `src/app/api/generate-program-preview/route.ts` | Route API preview (sans auth) |

## Sélection du modèle

Le modèle est choisi dynamiquement selon la durée du programme :

| Durée | Modèle | Tokens max | Raison |
|-------|--------|-----------|--------|
| 10 semaines ou moins | Claude 3.5 Haiku | 8 000 | Rapide et suffisant pour des programmes courts |
| Plus de 10 semaines | Claude Sonnet 4.5 | 16 384 | Plus de capacité pour des programmes longs et détaillés |

En cas d'erreur de parsing, le retry utilise toujours Sonnet 4.5 pour maximiser la fiabilité.

## Construction du prompt

### Données d'entrée

```typescript
{
  level: "débutant" | "intermédiaire" | "avancé",
  goal: "5K" | "10K" | "semi-marathon" | "marathon" | "améliorer-endurance",
  target_date?: string,        // Date de la course cible
  sessions_per_week: 2-7,
  reference_time?: string,     // Meilleur temps récent
  injuries_notes?: string,     // Blessures/précautions
  race?: Race                  // Données de la course (terrain, dénivelé, météo)
}
```

### Calcul du nombre de semaines

1. **Avec date cible** : semaines entre maintenant et la date, bornées par min/max selon l'objectif
2. **Sans date** : déterminé par le niveau et l'objectif
   - Débutant + 5K : 8 semaines
   - Avancé + Marathon : 16 semaines
   - Maximum : 20 semaines (engagement)

### Structure du prompt

Le prompt système (`prompts.ts`) contient :

1. **Rôle** : Coach expert en course à pied, méthodologie Jack Daniels
2. **Principes** :
   - Ratio 85/15 endurance/intensité (débutants)
   - Progression maximale +8-10% volume/semaine
   - Semaine de récupération toutes les 3 semaines
   - Priorité à la prévention des blessures
3. **Adaptations blessures** : Genou, tendon d'Achille, périostite
4. **Adaptations course** :
   - Trail : Côtes, descentes techniques, proprioception
   - Ultra : Back-to-back, pratique nutrition, prépa mentale
   - Chaleur : Acclimatation progressive, stratégie hydratation
5. **Contrainte stricte** : Exactement N séances + (7-N) jours de repos par semaine

### Contexte course

Si une course est sélectionnée, des informations supplémentaires sont injectées :
- Nom, distance, dénivelé positif/négatif
- Type de terrain (route/trail/mixte)
- Météo typique
- Points clés du parcours

## Format de sortie

```typescript
interface ProgramData {
  user_profile: {
    level: string;
    goal: string;
    sessions_per_week: number;
    target_date?: string;
  };
  program_summary: {
    total_weeks: number;
    philosophy: string;
    key_phases: string[];
    weekly_volume_progression: string;
  };
  weeks: Week[];
  tips: {
    nutrition: string[];
    recovery: string[];
    mental: string[];
  };
}

interface Week {
  week_number: number;
  focus: string;
  total_volume_km: number;
  notes: string;
  sessions: Session[];
}

interface Session {
  day: string;              // "Lundi", "Mardi", etc.
  rest_day: boolean;
  session_type?: string;    // "Endurance fondamentale", "Fractionné", etc.
  duration_min?: number;
  distance_km?: number;
  pace_target?: string;     // "5:30-6:00/km"
  description?: string;
  rpe?: number;             // 1-10
  workout_structure?: string;
  intervals?: Interval[];
}
```

## Validation post-génération

1. **Parsing JSON** : Extraction du JSON depuis la réponse Claude (avec gestion des balises markdown)
2. **Structure** : Vérification de la présence de `weeks[]`
3. **Nombre de semaines** : Doit correspondre au `weeksAvailable` calculé
4. **Séances par semaine** : Vérification du compte exact
5. **Auto-correction** : Si le nombre de séances ne correspond pas, `user_profile.sessions_per_week` est ajusté

## Gestion d'erreurs

| Erreur | Action |
|--------|--------|
| JSON invalide | Retry avec Sonnet 4.5 |
| Programme incomplet (semaines manquantes) | Retry avec Sonnet 4.5 |
| Échec du retry | Retour erreur 500 au client |
| Rate limit Anthropic | Retour erreur avec message explicite |

## Daily check-in adaptatif

Après la génération initiale, le système s'adapte quotidiennement :

### Logique d'ajustement

```
feeling = 1 (en forme)
  → Pas d'ajustement
  → Message: "Donne tout !"

feeling = 2 (fatigué)
  → Intensité -10%
  → Allures ajustées (ex: 5:30/km → 6:03/km)
  → Fractionné → Endurance fondamentale
  → Message explicatif

feeling = 3 (très fatigué) OU 2+ jours fatigué consécutifs
  → Repos forcé
  → Message: recommandation repos complet
```

### Ajustement des allures

Pour un ressenti "fatigué", les allures sont recalculées :
- Parsing du format `X:XX/km` ou `X:XX-Y:YY/km`
- Application du facteur de réduction (1.1 = +10% temps par km)
- Reformatage en `X:XX/km`

## Score de risque blessure

Fichier : `src/lib/utils/injury-risk.ts`

Le score (0-100) est calculé en combinant :

| Facteur | Points max | Méthode |
|---------|-----------|---------|
| Spike de volume | 30 | Comparaison volume semaine N vs N-1 (>10% = risque) |
| Ratio intensité | 20 | % de séances intenses (>20% = risque) |
| Fatigue moyenne | 25 | Moyenne des check-ins récents |
| Renforcement musculaire | 5 | Présence de séances de renforcement |
| Jours de repos | 10 | Moins de 2 repos/semaine = risque |

Le widget affiche un code couleur (vert/jaune/rouge) et jusqu'à 3 recommandations actionnables.
