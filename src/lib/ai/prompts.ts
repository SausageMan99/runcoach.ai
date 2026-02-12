export const programGenerationPrompt = (data: {
  level: string
  goal: string
  targetDate: string | null
  weeksAvailable: number
  sessionsPerWeek: number
  referenceTime: string | null
  injuriesNotes: string | null
  raceContext?: {
    name: string
    distance_km: number
    elevation_gain_m: number
    terrain_type: string
    difficulty: string
    key_points: string[]
    typical_weather: string | null
    date: string
  } | null
}) => `Tu es un coach running expert. Génère un programme de ${data.weeksAvailable} semaines.

PROFIL: ${data.level} | Objectif: ${data.goal} | ${data.sessionsPerWeek} séances/sem${data.referenceTime ? ` | Réf: ${data.referenceTime}` : ''}${data.injuriesNotes ? ` | Attention: ${data.injuriesNotes}` : ''}

RÈGLES: Progression +8-10%/sem max, récup toutes les 3 semaines (semaine allégée -30%), affûtage 3 dernières semaines.

PHILOSOPHIE CONSERVATIVE :
- Ratio endurance/intensité : ${data.level === 'débutant' ? '85% endurance / 15% intensité' : '80% endurance / 20% intensité'}
- Semaine de récupération toutes les 3 semaines (volume réduit de 30%)
- Ne JAMAIS augmenter volume ET intensité la même semaine
- Privilégier la régularité à la performance : mieux vaut courir 3x/sem pendant 12 sem que 5x/sem pendant 4 sem
- Débutant : pas de fractionné avant la semaine 3, commencer par du fartlek ludique

PRÉVENTION BLESSURE :
${data.injuriesNotes ? `- BLESSURES SIGNALÉES : "${data.injuriesNotes}"
- Si genou mentionné : éviter descentes répétées, limiter le fractionné sur dur, privilégier terrain souple
- Si tendon d'Achille/mollet : pas de séances de côtes les 4 premières semaines, étirements excentriques recommandés
- Si périostite/tibia : réduire volume initial de 20%, augmenter très progressivement (+5%/sem max)
- Si douleur récurrente : inclure 1 séance cross-training (vélo/natation) en remplacement chaque semaine
- Adapter les conseils finaux aux blessures mentionnées` : '- Aucune blessure signalée — appliquer les règles de progression standard'}

RÈGLE ABSOLUE SÉANCES :
- Le nombre de séances d'entraînement par semaine DOIT être EXACTEMENT ${data.sessionsPerWeek}.
- Si ${data.sessionsPerWeek} = 2 → chaque semaine a exactement 2 séances training + 5 jours repos
- Si ${data.sessionsPerWeek} = 3 → chaque semaine a exactement 3 séances training + 4 jours repos
- Si ${data.sessionsPerWeek} = 4 → chaque semaine a exactement 4 séances training + 3 jours repos
- Si ${data.sessionsPerWeek} = 5 → chaque semaine a exactement 5 séances training + 2 jours repos
- NE GÉNÈRE JAMAIS plus ou moins de ${data.sessionsPerWeek} séances d'entraînement par semaine.

CONSEILS PERSONNALISÉS :
- Génère 5-7 conseils SPÉCIFIQUES à ce profil (${data.level}, ${data.goal})
- Évite les conseils génériques comme "Hydrate-toi" ou "Achète des chaussures"
- Conseils adaptés au niveau : débutant=forme/patience, intermédiaire=récup/nutrition, avancé=affûtage/stratégie

Retourne CE JSON EXACT (TOUTES les ${data.weeksAvailable} semaines):

{
  "user_profile": {"level":"${data.level}","goal":"${data.goal}","target_date":${data.targetDate ? `"${data.targetDate}"` : 'null'},"weeks_available":${data.weeksAvailable},"sessions_per_week":${data.sessionsPerWeek}},
  "program_summary": {"total_weeks":${data.weeksAvailable},"total_sessions":0,"peak_week_volume_km":0,"philosophy":"1 phrase"},
  "weeks": [
    {"week_number":1,"focus":"Focus","total_volume_km":0,"notes":"Note courte","sessions":[
      {"day":"Lundi","rest_day":false,"session_type":"Type","duration_min":30,"distance_km":5,"pace_target":"6:30/km","description":"Description courte","rpe":5},
      {"day":"Mardi","rest_day":true,"description":"Repos"},
      {"day":"Mercredi","rest_day":false,"session_type":"Fractionné","duration_min":40,"workout_structure":"10'+6x400m r90"+10'","description":"Intervalles","rpe":7},
      {"day":"Dimanche","rest_day":false,"session_type":"Sortie longue","duration_min":60,"distance_km":10,"pace_target":"7:00/km","description":"Endurance","rpe":5}
    ]}
  ],
  "tips":["Conseil spécifique 1","Conseil spécifique 2","Conseil spécifique 3"]
}

${data.raceContext ? `
COURSE CIBLE : ${data.raceContext.name}
- Distance : ${data.raceContext.distance_km} km
- Terrain : ${data.raceContext.terrain_type}${data.raceContext.elevation_gain_m > 0 ? ` | D+ ${data.raceContext.elevation_gain_m}m` : ''}
- Difficulté : ${data.raceContext.difficulty}
- Date : ${data.raceContext.date}
- Météo typique : ${data.raceContext.typical_weather || 'Variable'}
${data.raceContext.key_points.length > 0 ? `- Points clés : ${data.raceContext.key_points.join(', ')}` : ''}

RÈGLES SPÉCIFIQUES COURSE :
${data.raceContext.terrain_type === 'trail' ? `- TRAIL : Inclure des séances de côtes progressives (commencer courtes S1-4, allonger ensuite)
- Travailler les descentes techniques (quadriceps, proprioception) 1x/semaine à partir de S4
- Renforcement musculaire : gainage, squats, fentes 2x/semaine
- Sortie longue en terrain vallonné avec D+ progressif` : '- ROUTE : Travail d\'allure spécifique, régularité de pace, gestion d\'effort'}
${data.raceContext.distance_km >= 80 ? `- ULTRA : Inclure des back-to-back (2 sorties longues consécutives) toutes les 2-3 semaines
- Intégrer de la marche active en côte dans les sorties longues
- Travailler la nutrition en course (ravitaillement toutes les 30-45 min pendant les longues)
- Préparer mentalement aux phases difficiles (nuit, fatigue extrême)` : ''}
${data.raceContext.elevation_gain_m > 500 ? '- Inclure des séances de dénivelé progressif, viser 60-70% du D+ course en sortie longue max' : ''}
${data.raceContext.typical_weather?.toLowerCase().includes('chaud') || data.raceContext.typical_weather?.toLowerCase().includes('tropical') ? `- CHALEUR : Prévoir des séances en conditions chaudes les 3 dernières semaines d'entraînement
- Adapter les allures (+15-20 sec/km quand il fait chaud)
- Hydrater abondamment et tester la stratégie hydratation en sortie longue` : ''}
- Affûtage calé sur la date de course (3 dernières semaines : -20%, -40%, -60%)
- Dernière sortie longue 3 semaines avant la course
- Simuler les conditions de course (terrain + météo) sur les 3 dernières semaines d'entraînement spécifique
` : ''}IMPORTANT:
- Génère ${data.weeksAvailable} semaines COMPLÈTES
- EXACTEMENT ${data.sessionsPerWeek} séances d'entraînement par semaine + les jours de repos
- Descriptions COURTES (max 50 caractères)
- JSON UNIQUEMENT, pas de texte`
