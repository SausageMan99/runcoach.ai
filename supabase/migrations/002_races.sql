-- Races table for race-specific training
CREATE TABLE IF NOT EXISTS races (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'France',
    date DATE NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL,
    elevation_gain_m INTEGER DEFAULT 0,
    elevation_loss_m INTEGER DEFAULT 0,
    terrain_type TEXT NOT NULL DEFAULT 'route' CHECK (terrain_type IN ('route', 'trail', 'mixte')),
    difficulty TEXT NOT NULL DEFAULT 'moyen' CHECK (difficulty IN ('facile', 'moyen', 'difficile', 'expert')),
    key_points JSONB DEFAULT '[]'::jsonb,
    typical_weather TEXT,
    website_url TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_races_search ON races USING GIN(search_vector);
CREATE INDEX idx_races_date ON races(date);

-- Auto-update search vector
CREATE OR REPLACE FUNCTION races_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('french', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.city, '') || ' ' || COALESCE(NEW.country, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER races_search_vector_trigger
    BEFORE INSERT OR UPDATE ON races
    FOR EACH ROW EXECUTE FUNCTION races_search_vector_update();

-- RLS (public read)
ALTER TABLE races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read races"
    ON races FOR SELECT
    USING (true);

-- Add race_id to programs table
ALTER TABLE programs ADD COLUMN IF NOT EXISTS race_id UUID REFERENCES races(id) DEFAULT NULL;

-- Seed 10 major French races
INSERT INTO races (name, city, country, date, distance_km, elevation_gain_m, elevation_loss_m, terrain_type, difficulty, key_points, typical_weather, website_url) VALUES
('Marathon de Paris', 'Paris', 'France', '2027-04-06', 42.195, 50, 50, 'route', 'moyen',
 '["Champs-Elysées", "Bois de Vincennes", "Bois de Boulogne"]', 'Frais 8-15°C, variable', 'https://www.schneiderelectricparismarathon.com'),

('Semi de Paris', 'Paris', 'France', '2027-03-07', 21.1, 30, 30, 'route', 'facile',
 '["Bastille", "Bois de Vincennes"]', 'Frais 5-12°C', 'https://www.semi-marathon-de-paris.com'),

('Marathon de Lyon', 'Lyon', 'France', '2026-10-04', 42.195, 120, 120, 'route', 'moyen',
 '["Presqu''île", "Parc de la Tête d''Or", "Confluence"]', 'Doux 12-20°C', 'https://www.runninglyon.com'),

('Trail du Mont-Blanc (UTMB)', 'Chamonix', 'France', '2026-08-28', 171, 10000, 10000, 'trail', 'expert',
 '["Col du Bonhomme", "Courmayeur", "Champex-Lac", "La Flégère"]', 'Variable, montagne 0-25°C', 'https://utmbmontblanc.com'),

('Marathon de Bordeaux', 'Bordeaux', 'France', '2027-04-18', 42.195, 40, 40, 'route', 'facile',
 '["Quais de Garonne", "Cité du Vin", "Place de la Bourse"]', 'Doux 12-18°C', 'https://www.marathondebordeaux.com'),

('Marseille-Cassis', 'Marseille', 'France', '2026-10-25', 20.3, 340, 310, 'route', 'difficile',
 '["Col de la Gineste", "Route des Crêtes", "Cassis"]', 'Doux 15-22°C, vent possible', 'https://www.marseille-cassis.com'),

('Trail des Templiers', 'Millau', 'France', '2026-10-18', 75, 3500, 3500, 'trail', 'difficile',
 '["Causse Noir", "Gorges de la Dourbie", "Chaos de Montpellier-le-Vieux"]', 'Variable automne 5-15°C', 'https://www.festivaldestempliers.com'),

('10 km de Paris Centre', 'Paris', 'France', '2027-06-08', 10, 15, 15, 'route', 'facile',
 '["Notre-Dame", "Hôtel de Ville", "Ile de la Cité"]', 'Doux 15-22°C', NULL),

('Ekiden de Paris', 'Paris', 'France', '2026-11-15', 42.195, 30, 30, 'route', 'moyen',
 '["Relais 6 coureurs", "Bois de Boulogne"]', 'Frais 5-12°C', 'https://www.ekidendeparis.com'),

('SaintéLyon', 'Saint-Étienne', 'France', '2026-12-06', 76, 1800, 1950, 'trail', 'difficile',
 '["Nocturne", "Monts du Lyonnais", "Arrivée Lyon"]', 'Froid 0-8°C, nuit', 'https://www.saintelyon.com');
