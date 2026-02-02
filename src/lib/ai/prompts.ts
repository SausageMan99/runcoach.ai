export const programGenerationPrompt = (data: {
  level: string
  goal: string
  targetDate: string | null
  weeksAvailable: number
  sessionsPerWeek: number
  referenceTime: string | null
  injuriesNotes: string | null
}) => `Tu es un coach running expert. Génère un programme de ${data.weeksAvailable} semaines.

PROFIL: ${data.level} | Objectif: ${data.goal} | ${data.sessionsPerWeek} séances/sem${data.referenceTime ? ` | Réf: ${data.referenceTime}` : ''}${data.injuriesNotes ? ` | Attention: ${data.injuriesNotes}` : ''}

RÈGLES: Progression +10%/sem, 80% endurance 20% intensité, récup S${Math.floor(data.weeksAvailable / 2)}, affûtage 2 dernières sem.

Retourne CE JSON EXACT (TOUTES les ${data.weeksAvailable} semaines):

{
  "user_profile": {"level":"${data.level}","goal":"${data.goal}","target_date":${data.targetDate ? `"${data.targetDate}"` : 'null'},"weeks_available":${data.weeksAvailable},"sessions_per_week":${data.sessionsPerWeek}},
  "program_summary": {"total_weeks":${data.weeksAvailable},"total_sessions":0,"peak_week_volume_km":0,"philosophy":"1 phrase"},
  "weeks": [
    {"week_number":1,"focus":"Focus","total_volume_km":0,"notes":"Note courte","sessions":[
      {"day":"Lundi","rest_day":false,"session_type":"Type","duration_min":30,"distance_km":5,"pace_target":"6:30/km","description":"Description courte","rpe":5},
      {"day":"Mardi","rest_day":true,"description":"Repos"},
      {"day":"Mercredi","rest_day":false,"session_type":"Fractionné","duration_min":40,"workout_structure":"10'+6x400m r90\"+10'","description":"Intervalles","rpe":7},
      {"day":"Dimanche","rest_day":false,"session_type":"Sortie longue","duration_min":60,"distance_km":10,"pace_target":"7:00/km","description":"Endurance","rpe":5}
    ]}
  ],
  "tips":["Conseil 1","Conseil 2","Conseil 3"]
}

IMPORTANT: 
- Génère ${data.weeksAvailable} semaines COMPLÈTES
- ${data.sessionsPerWeek} séances/semaine + repos
- Descriptions COURTES (max 50 caractères)
- JSON UNIQUEMENT, pas de texte`
