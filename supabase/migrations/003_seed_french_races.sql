-- Seed ~40 additional French races
-- Marathons régionaux, semis, 10K, trails, ultras, courses spéciales

INSERT INTO races (name, city, country, date, distance_km, elevation_gain_m, elevation_loss_m, terrain_type, difficulty, key_points, typical_weather, website_url) VALUES

-- === MARATHONS RÉGIONAUX ===
('Marathon de Nice-Cannes', 'Nice', 'France', '2026-11-08', 42.195, 80, 80, 'route', 'moyen',
 '["Promenade des Anglais", "Bord de mer", "Croisette Cannes"]', 'Doux 12-18°C, ensoleillé', 'https://www.marathon06.com'),

('Marathon de Toulouse', 'Toulouse', 'France', '2026-10-18', 42.195, 60, 60, 'route', 'facile',
 '["Capitole", "Garonne", "Cité de l''Espace"]', 'Doux 14-22°C', 'https://www.marathondetoulouse.fr'),

('Marathon de Nantes', 'Nantes', 'France', '2027-04-25', 42.195, 45, 45, 'route', 'facile',
 '["Château des Ducs", "Ile de Nantes", "Erdre"]', 'Doux 10-16°C, humide possible', 'https://www.marathondenantes.com'),

('Marathon de Strasbourg', 'Strasbourg', 'France', '2026-10-25', 42.195, 35, 35, 'route', 'facile',
 '["Petite France", "Parlement Européen", "Cathédrale"]', 'Frais 8-15°C', 'https://www.marathon-strasbourg.com'),

('Marathon d''Annecy', 'Annecy', 'France', '2027-04-13', 42.195, 150, 150, 'route', 'moyen',
 '["Lac d''Annecy", "Vieille ville", "Piste cyclable du lac"]', 'Frais 8-16°C, vue montagne', 'https://www.marathondannecy.com'),

('Marathon de Rennes', 'Rennes', 'France', '2026-10-11', 42.195, 70, 70, 'route', 'moyen',
 '["Centre historique", "Parc du Thabor", "Vilaine"]', 'Doux 10-16°C, breton variable', 'https://www.marathonderennes.com'),

('Marathon de La Rochelle', 'La Rochelle', 'France', '2026-11-29', 42.195, 25, 25, 'route', 'facile',
 '["Vieux Port", "Tours médiévales", "Front de mer"]', 'Doux 8-14°C, vent côtier', 'https://www.marathondelarochelle.com'),

('Marathon du Médoc', 'Pauillac', 'France', '2026-09-12', 42.195, 60, 60, 'route', 'moyen',
 '["Vignobles", "Châteaux", "Dégustations", "Déguisements obligatoires"]', 'Chaud 18-28°C', 'https://www.marathondumedoc.com'),

('Marathon de Montpellier', 'Montpellier', 'France', '2027-03-14', 42.195, 55, 55, 'route', 'facile',
 '["Place de la Comédie", "Antigone", "Lez"]', 'Doux 12-18°C', 'https://www.marathondemontpellier.com'),

-- === SEMI-MARATHONS ===
('Semi-Marathon de Lille', 'Lille', 'France', '2026-09-06', 21.1, 20, 20, 'route', 'facile',
 '["Grand Place", "Vieux Lille", "Citadelle"]', 'Frais 12-18°C', 'https://www.semi-marathon-de-lille.fr'),

('Semi-Marathon de Boulogne-Billancourt', 'Boulogne-Billancourt', 'France', '2026-11-22', 21.1, 35, 35, 'route', 'facile',
 '["Bois de Boulogne", "Berges de Seine", "Parc de Saint-Cloud"]', 'Frais 5-12°C', 'https://www.semi-boulogne.com'),

('Semi-Marathon de Versailles', 'Versailles', 'France', '2027-05-30', 21.1, 90, 90, 'route', 'moyen',
 '["Château de Versailles", "Parc", "Pièce d''eau des Suisses"]', 'Doux 14-20°C', NULL),

('Semi-Marathon de Nice', 'Nice', 'France', '2027-04-20', 21.1, 40, 40, 'route', 'facile',
 '["Promenade des Anglais", "Port", "Colline du Château"]', 'Doux 14-20°C, ensoleillé', NULL),

('Semi-Marathon de Bordeaux', 'Bordeaux', 'France', '2027-03-21', 21.1, 25, 25, 'route', 'facile',
 '["Quais", "Miroir d''eau", "Chartrons"]', 'Doux 10-16°C', NULL),

('Semi-Marathon de Toulouse', 'Toulouse', 'France', '2027-02-14', 21.1, 30, 30, 'route', 'facile',
 '["Capitole", "Canal du Midi", "Garonne"]', 'Frais 6-12°C', NULL),

('Semi-Marathon de Nantes', 'Nantes', 'France', '2027-03-07', 21.1, 25, 25, 'route', 'facile',
 '["Machines de l''Ile", "Château", "Erdre"]', 'Frais 8-14°C', NULL),

-- === 10K POPULAIRES ===
('10K Paris Adidas', 'Paris', 'France', '2026-06-14', 10, 15, 15, 'route', 'facile',
 '["Champs-Elysées", "Grand Palais", "Place de la Concorde"]', 'Doux 16-24°C', 'https://www.adidas10kparis.com'),

('La Parisienne', 'Paris', 'France', '2026-09-13', 6.7, 10, 10, 'route', 'facile',
 '["Course féminine", "Champ-de-Mars", "Tour Eiffel"]', 'Doux 16-22°C', 'https://www.la-parisienne.net'),

('10K Lyon Urban Trail', 'Lyon', 'France', '2027-04-06', 10, 180, 180, 'mixte', 'moyen',
 '["Traboules", "Fourvière", "Vieux Lyon", "Croix-Rousse"]', 'Doux 10-18°C', 'https://www.lyonurbantrail.com'),

('10K de Toulouse', 'Toulouse', 'France', '2026-10-18', 10, 15, 15, 'route', 'facile',
 '["Capitole", "Garonne"]', 'Doux 14-22°C', NULL),

('10K de Strasbourg', 'Strasbourg', 'France', '2026-10-25', 10, 10, 10, 'route', 'facile',
 '["Centre-ville", "Ill", "Orangerie"]', 'Frais 8-15°C', NULL),

-- === TRAILS ===
('Trail du Ventoux', 'Bédoin', 'France', '2026-06-20', 46, 2600, 2600, 'trail', 'difficile',
 '["Mont Ventoux 1912m", "Sommet calcaire", "Forêt de cèdres"]', 'Variable, vent violent possible, 5-25°C', 'https://www.trailduventoux.com'),

('Maxi-Race du Lac d''Annecy', 'Annecy', 'France', '2027-05-30', 85, 5200, 5200, 'trail', 'expert',
 '["Tour du lac", "Semnoz", "Tournette", "Col de la Forclaz"]', 'Variable montagne 5-20°C', 'https://www.maxi-race.org'),

('Trail Blanc Méribel', 'Méribel', 'France', '2027-01-24', 22, 1200, 1200, 'trail', 'difficile',
 '["Neige", "Raquettes", "2000m altitude", "Nocturne"]', 'Froid -10 à 5°C, neige', 'https://www.trailblancmeribel.com'),

('Grand Trail du Lac', 'Aix-les-Bains', 'France', '2026-09-19', 65, 3800, 3800, 'trail', 'difficile',
 '["Lac du Bourget", "Mont du Chat", "Dent du Chat"]', 'Variable automne 8-18°C', NULL),

('Trail des Aiguilles Rouges', 'Chamonix', 'France', '2026-07-04', 30, 2100, 2100, 'trail', 'difficile',
 '["Réserve Aiguilles Rouges", "Lac Blanc 2352m", "Vue Mont-Blanc"]', 'Variable montagne 5-18°C', NULL),

('Trail de Gavarnie', 'Gavarnie', 'France', '2026-08-08', 40, 2500, 2500, 'trail', 'difficile',
 '["Cirque de Gavarnie", "Brèche de Roland", "Cascade 423m"]', 'Variable Pyrénées 8-20°C', NULL),

('Trail des Passerelles du Monteynard', 'Monteynard', 'France', '2026-06-27', 28, 1400, 1400, 'trail', 'moyen',
 '["Passerelles himalayennes", "Lac de Monteynard", "Gorges"]', 'Doux 15-25°C', NULL),

('EcoTrail de Paris', 'Paris', 'France', '2027-03-20', 80, 1500, 1500, 'trail', 'difficile',
 '["Forêt de Meudon", "Versailles", "Tour Eiffel arrivée"]', 'Frais 6-14°C', 'https://www.ecotrail-paris.com'),

-- === ULTRAS ===
('Diagonale des Fous', 'Saint-Denis (Réunion)', 'France', '2026-10-22', 163, 9576, 9576, 'trail', 'expert',
 '["Grand Raid Réunion", "Piton des Neiges", "Mafate", "Cilaos"]', 'Tropical variable 5-30°C', 'https://www.grandraid-reunion.com'),

('Grand Raid des Pyrénées', 'Vielle-Aure', 'France', '2026-08-20', 160, 10500, 10500, 'trail', 'expert',
 '["Ultra", "Pic du Midi", "Néouvielle", "Cirques pyrénéens"]', 'Variable montagne 5-25°C', 'https://www.grandraidpyrenees.com'),

('L''Échappée Belle', 'Vizille', 'France', '2026-08-13', 144, 11000, 11000, 'trail', 'expert',
 '["Belledonne", "7 Laux", "Col du Merdaret", "Traversée intégrale"]', 'Variable haute montagne 0-20°C', 'https://www.lechappeebelle.com'),

('100 km de Millau', 'Millau', 'France', '2026-09-26', 100, 800, 800, 'route', 'difficile',
 '["Viaduc de Millau", "Grands Causses", "Gorges du Tarn"]', 'Doux 12-22°C', 'https://www.100kmdemillau.com'),

('Ultra-Trail du Jura', 'Lons-le-Saunier', 'France', '2026-06-06', 105, 4500, 4500, 'trail', 'expert',
 '["Crêts du Jura", "Cascades du Hérisson", "Reculées"]', 'Variable 8-20°C', NULL),

-- === COURSES SPÉCIALES ===
('20 km de Paris', 'Paris', 'France', '2026-10-11', 20, 40, 40, 'route', 'moyen',
 '["Tour Eiffel", "Trocadéro", "Bois de Boulogne"]', 'Frais 10-16°C', 'https://www.20kmdeparis.com'),

('Corrida de Noël d''Issy', 'Issy-les-Moulineaux', 'France', '2026-12-13', 10, 20, 20, 'route', 'facile',
 '["Nocturne", "Ambiance festive", "Déguisements"]', 'Froid 2-8°C', NULL),

('Cross du Figaro', 'Bois de Boulogne', 'France', '2027-01-17', 8.5, 30, 30, 'mixte', 'moyen',
 '["Cross historique", "Herbe et terre", "Hippodrome de Longchamp"]', 'Froid 2-8°C', NULL),

('Les Foulées de la Soie', 'Lyon', 'France', '2026-11-08', 10, 20, 20, 'route', 'facile',
 '["Croix-Rousse", "Quartier de la soie", "Traboules"]', 'Frais 6-12°C', NULL),

('Courir à Marseille', 'Marseille', 'France', '2027-03-28', 10, 50, 50, 'route', 'facile',
 '["Vieux Port", "Corniche Kennedy", "Plages du Prado"]', 'Doux 12-18°C', NULL),

('Les Courses du Louvre', 'Paris', 'France', '2027-01-31', 7, 10, 10, 'route', 'facile',
 '["Jardin des Tuileries", "Pyramide du Louvre", "Nocturne"]', 'Froid 2-8°C', NULL);
