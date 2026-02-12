-- Additional French races: marathons, semis, 10K, trails, ultras
-- Extends the existing ~50 races to ~150+

-- MARATHONS
INSERT INTO races (name, city, country, date, distance_km, elevation_gain_m, elevation_loss_m, terrain_type, difficulty, typical_weather) VALUES
('Marathon de Toulouse', 'Toulouse', 'France', '2027-10-24', 42.195, 150, 150, 'route', 'facile', 'Doux, 12-18°C'),
('Marathon de Nice-Cannes', 'Nice', 'France', '2027-11-07', 42.195, 250, 250, 'route', 'moyen', 'Doux, 10-16°C, bord de mer'),
('Marathon de La Rochelle', 'La Rochelle', 'France', '2027-11-28', 42.195, 80, 80, 'route', 'facile', 'Frais, 8-14°C, possible vent'),
('Marathon de Nantes', 'Nantes', 'France', '2027-04-18', 42.195, 120, 120, 'route', 'facile', 'Doux, 10-16°C'),
('Marathon de Reims', 'Reims', 'France', '2027-10-17', 42.195, 90, 90, 'route', 'facile', 'Frais, 8-14°C'),
('Marathon de Strasbourg', 'Strasbourg', 'France', '2027-05-22', 42.195, 100, 100, 'route', 'facile', 'Variable, 12-20°C'),
('Marathon de Lille', 'Lille', 'France', '2027-09-05', 42.195, 70, 70, 'route', 'facile', 'Frais, 14-20°C'),
('Marathon de Rennes', 'Rennes', 'France', '2027-10-24', 42.195, 180, 180, 'route', 'moyen', 'Frais, 10-16°C'),
('Marathon d''Annecy', 'Annecy', 'France', '2027-04-25', 42.195, 200, 200, 'route', 'moyen', 'Frais, 8-15°C, vue lac'),
('Marathon du Cognac', 'Cognac', 'France', '2027-10-31', 42.195, 150, 150, 'route', 'moyen', 'Doux, 10-16°C'),
('Marathon de Montpellier', 'Montpellier', 'France', '2027-03-14', 42.195, 120, 120, 'route', 'facile', 'Doux, 10-18°C'),
('Marathon de Metz', 'Metz', 'France', '2027-10-10', 42.195, 100, 100, 'route', 'facile', 'Frais, 8-14°C'),
('Marathon du Médoc', 'Pauillac', 'France', '2027-09-11', 42.195, 100, 100, 'route', 'moyen', 'Chaud, 18-28°C, festif'),
('Marathon de Tours', 'Tours', 'France', '2027-09-26', 42.195, 90, 90, 'route', 'facile', 'Doux, 14-20°C'),
('Marathon de Vannes', 'Vannes', 'France', '2027-10-03', 42.195, 130, 130, 'route', 'facile', 'Frais, 12-18°C')
ON CONFLICT DO NOTHING;

-- SEMI-MARATHONS
INSERT INTO races (name, city, country, date, distance_km, elevation_gain_m, elevation_loss_m, terrain_type, difficulty, typical_weather) VALUES
('Semi-Marathon de Lille', 'Lille', 'France', '2027-09-05', 21.1, 50, 50, 'route', 'facile', 'Frais, 14-20°C'),
('Semi-Marathon de Nice', 'Nice', 'France', '2027-05-16', 21.1, 120, 120, 'route', 'moyen', 'Doux, 14-22°C'),
('Semi-Marathon de Bordeaux', 'Bordeaux', 'France', '2027-03-21', 21.1, 90, 90, 'route', 'facile', 'Doux, 10-16°C'),
('Semi-Marathon de Nantes', 'Nantes', 'France', '2027-04-11', 21.1, 80, 80, 'route', 'facile', 'Doux, 10-16°C'),
('Semi-Marathon de Toulouse', 'Toulouse', 'France', '2027-10-17', 21.1, 100, 100, 'route', 'facile', 'Doux, 12-18°C'),
('Semi-Marathon de Lyon', 'Lyon', 'France', '2027-09-26', 21.1, 150, 150, 'route', 'moyen', 'Doux, 14-22°C'),
('Semi-Marathon de Strasbourg', 'Strasbourg', 'France', '2027-05-16', 21.1, 70, 70, 'route', 'facile', 'Variable, 12-20°C'),
('Semi-Marathon de Reims', 'Reims', 'France', '2027-10-10', 21.1, 60, 60, 'route', 'facile', 'Frais, 8-14°C'),
('Semi-Marathon de Caen', 'Caen', 'France', '2027-04-18', 21.1, 80, 80, 'route', 'facile', 'Frais, 10-16°C'),
('Semi des Courants de la Liberté', 'Caen', 'France', '2027-06-13', 21.1, 85, 85, 'route', 'facile', 'Doux, 14-20°C'),
('Semi-Marathon de Montpellier', 'Montpellier', 'France', '2027-03-28', 21.1, 100, 100, 'route', 'facile', 'Doux, 12-20°C'),
('Semi-Marathon de Grenoble', 'Grenoble', 'France', '2027-10-03', 21.1, 120, 120, 'route', 'moyen', 'Frais, 8-16°C'),
('Semi-Marathon de Dijon', 'Dijon', 'France', '2027-10-31', 21.1, 90, 90, 'route', 'facile', 'Frais, 8-14°C'),
('Semi-Marathon de Rouen', 'Rouen', 'France', '2027-09-19', 21.1, 100, 100, 'route', 'facile', 'Frais, 12-18°C'),
('Semi-Marathon de Boulogne-Billancourt', 'Boulogne-Billancourt', 'France', '2027-11-21', 21.1, 60, 60, 'route', 'facile', 'Frais, 6-12°C')
ON CONFLICT DO NOTHING;

-- 10KM
INSERT INTO races (name, city, country, date, distance_km, elevation_gain_m, elevation_loss_m, terrain_type, difficulty, typical_weather) VALUES
('10km de La Parisienne', 'Paris', 'France', '2027-09-12', 10, 50, 50, 'route', 'facile', 'Doux, 16-22°C'),
('10km Adidas Paris', 'Paris', 'France', '2027-06-05', 10, 40, 40, 'route', 'facile', 'Chaud, 18-25°C'),
('10km de Lyon', 'Lyon', 'France', '2027-05-09', 10, 60, 60, 'route', 'facile', 'Doux, 14-22°C'),
('10km de Marseille', 'Marseille', 'France', '2027-03-28', 10, 80, 80, 'route', 'facile', 'Doux, 12-18°C'),
('10km de Toulouse', 'Toulouse', 'France', '2027-05-23', 10, 50, 50, 'route', 'facile', 'Doux, 14-22°C'),
('10km de Nice', 'Nice', 'France', '2027-04-25', 10, 90, 90, 'route', 'moyen', 'Doux, 14-22°C'),
('10km de Strasbourg', 'Strasbourg', 'France', '2027-09-18', 10, 40, 40, 'route', 'facile', 'Doux, 14-20°C'),
('Corrida de Noël Issy', 'Issy-les-Moulineaux', 'France', '2027-12-11', 10, 50, 50, 'route', 'facile', 'Froid, 2-8°C'),
('10km de Bordeaux', 'Bordeaux', 'France', '2027-04-11', 10, 40, 40, 'route', 'facile', 'Doux, 12-18°C'),
('10km de Nantes', 'Nantes', 'France', '2027-05-30', 10, 50, 50, 'route', 'facile', 'Doux, 14-20°C'),
('10km de Rennes', 'Rennes', 'France', '2027-10-10', 10, 60, 60, 'route', 'facile', 'Frais, 10-16°C'),
('10km de Montpellier', 'Montpellier', 'France', '2027-03-14', 10, 50, 50, 'route', 'facile', 'Doux, 10-18°C'),
('10km de Grenoble', 'Grenoble', 'France', '2027-06-06', 10, 70, 70, 'route', 'facile', 'Doux, 14-22°C')
ON CONFLICT DO NOTHING;

-- TRAILS
INSERT INTO races (name, city, country, date, distance_km, elevation_gain_m, elevation_loss_m, terrain_type, difficulty, typical_weather, key_points) VALUES
-- UTMB Series
('UTMB', 'Chamonix', 'France', '2027-08-27', 171, 10000, 10000, 'trail', 'expert', 'Variable 5-25°C, possible neige en altitude', '["Col de la Forclaz","Grand Col Ferret","Col de la Seigne","Tête aux Vents"]'::jsonb),
('CCC', 'Chamonix', 'France', '2027-08-26', 101, 6100, 6100, 'trail', 'difficile', 'Variable 5-25°C', '["Grand Col Ferret","Arnouvaz","La Flégère"]'::jsonb),
('OCC', 'Chamonix', 'France', '2027-08-25', 56, 3500, 3500, 'trail', 'difficile', 'Variable 8-25°C', '["Champex-Lac","Bovine","La Flégère"]'::jsonb),
('TDS', 'Chamonix', 'France', '2027-08-25', 145, 9100, 9100, 'trail', 'expert', 'Variable 5-25°C, haute montagne', '["Passeur de Pralognan","Col des Chavannes","Col du Petit Saint-Bernard"]'::jsonb),

-- Eco-Trail Paris
('Eco-Trail Paris 80km', 'Paris', 'France', '2027-03-21', 80, 1900, 1900, 'trail', 'difficile', 'Frais, 6-14°C', '["Forêt de Meudon","Bois de Boulogne","Tour Eiffel"]'::jsonb),
('Eco-Trail Paris 50km', 'Paris', 'France', '2027-03-21', 50, 1200, 1200, 'trail', 'moyen', 'Frais, 6-14°C', NULL),
('Eco-Trail Paris 30km', 'Paris', 'France', '2027-03-21', 30, 700, 700, 'trail', 'moyen', 'Frais, 6-14°C', NULL),
('Eco-Trail Paris 18km', 'Paris', 'France', '2027-03-21', 18, 400, 400, 'trail', 'facile', 'Frais, 6-14°C', NULL),

-- Trails régionaux
('Trail des Aiguilles Rouges', 'Chamonix', 'France', '2027-07-15', 55, 3200, 3200, 'trail', 'difficile', 'Variable 5-20°C, montagne', NULL),
('Trail du Ventoux', 'Mont Ventoux', 'France', '2027-06-12', 46, 2200, 2200, 'trail', 'difficile', 'Variable, vent violent possible', '["Sommet du Ventoux","Mont Serein"]'::jsonb),
('Trail de Fontainebleau', 'Fontainebleau', 'France', '2027-05-22', 45, 1200, 1200, 'trail', 'moyen', 'Doux, 12-20°C', NULL),
('Trail des Balcons d''Azur', 'Nice', 'France', '2027-04-10', 72, 3800, 3800, 'trail', 'difficile', 'Doux, 10-20°C', NULL),
('Trail Glazig', 'Brest', 'France', '2027-05-30', 65, 1900, 1900, 'trail', 'difficile', 'Frais, 10-16°C, possible pluie', NULL),
('Trail du Bout du Monde', 'Crozon', 'France', '2027-06-19', 72, 2200, 2200, 'trail', 'difficile', 'Frais, 12-18°C, breton', NULL),
('Grand Trail des Templiers', 'Millau', 'France', '2027-10-23', 71, 3000, 3000, 'trail', 'difficile', 'Frais, 6-14°C', '["Gorges de la Dourbie","Causse Noir"]'::jsonb),
('Trail de Vulcain', 'Clermont-Ferrand', 'France', '2027-05-15', 80, 3200, 3200, 'trail', 'difficile', 'Variable, 8-18°C', NULL),
('SaintéLyon', 'Saint-Étienne', 'France', '2027-12-04', 78, 2100, 2100, 'trail', 'moyen', 'Froid nocturne, 0-8°C', '["Col de la Croix de Part","Monts du Lyonnais"]'::jsonb),
('Trail du Sancy', 'Le Mont-Dore', 'France', '2027-07-10', 42, 2100, 2100, 'trail', 'difficile', 'Variable, 8-18°C, montagne', NULL),
('Trail des Passerelles du Monteynard', 'Grenoble', 'France', '2027-06-05', 28, 1400, 1400, 'trail', 'moyen', 'Doux, 14-22°C', NULL),
('Trail du Pays Cathare', 'Carcassonne', 'France', '2027-05-08', 62, 2800, 2800, 'trail', 'difficile', 'Doux, 12-22°C', NULL),

-- Ultra-trails
('Diagonale des Fous', 'La Réunion', 'France', '2027-10-21', 165, 9900, 9900, 'trail', 'expert', 'Tropical 5-30°C, variable altitude', '["Piton des Neiges","Mafate","Cilaos","Mare à Boue"]'::jsonb),
('Grand Raid des Pyrénées', 'Vielle-Aure', 'France', '2027-08-20', 160, 10000, 10000, 'trail', 'expert', 'Variable 5-25°C, haute montagne', NULL),
('Ultra-Trail Côte d''Azur', 'Nice', 'France', '2027-05-14', 115, 6700, 6700, 'trail', 'expert', 'Doux, 10-22°C', NULL),
('Infernal Trail des Vosges', 'Xonrupt', 'France', '2027-06-26', 112, 6200, 6200, 'trail', 'expert', 'Variable, 8-22°C', NULL),
('Ultra-Marin Raid Golfe du Morbihan', 'Vannes', 'France', '2027-09-17', 177, 4500, 4500, 'trail', 'expert', 'Doux, 12-20°C, côtier', NULL),
('Transgrancanaria', 'Gran Canaria', 'Espagne', '2027-02-26', 128, 7500, 7500, 'trail', 'expert', 'Chaud, 15-30°C', NULL),
('Trail des Corsaires', 'Bayonne', 'France', '2027-04-03', 48, 2100, 2100, 'trail', 'moyen', 'Doux, 12-18°C', NULL),
('Maxi-Race Annecy', 'Annecy', 'France', '2027-05-29', 87, 5200, 5200, 'trail', 'difficile', 'Variable, 8-20°C', '["Semnoz","Tournette","Lac d''Annecy"]'::jsonb),
('Trail de la Sainte-Victoire', 'Aix-en-Provence', 'France', '2027-03-20', 50, 2400, 2400, 'trail', 'moyen', 'Doux, 10-18°C', NULL),
('Trail Verbier Saint-Bernard', 'Verbier', 'Suisse', '2027-07-17', 111, 7100, 7100, 'trail', 'expert', 'Variable, 5-20°C, haute montagne', NULL),

-- 5K populaires
('La Parisienne 7km', 'Paris', 'France', '2027-09-12', 7, 30, 30, 'route', 'facile', 'Doux, 16-22°C', NULL),
('Color Run Paris', 'Paris', 'France', '2027-06-12', 5, 20, 20, 'route', 'facile', 'Chaud, 18-25°C, festif', NULL),
('Mud Day Paris', 'Paris', 'France', '2027-05-15', 13, 100, 100, 'mixte', 'moyen', 'Variable, obstacle race', NULL)
ON CONFLICT DO NOTHING;

-- Create indexes for optimized search
CREATE INDEX IF NOT EXISTS idx_races_distance ON races(distance_km);
CREATE INDEX IF NOT EXISTS idx_races_terrain ON races(terrain_type);
CREATE INDEX IF NOT EXISTS idx_races_date ON races(date);
