-- Index pour la recherche principale sur HOTEL
---- Utilité :
---- accélère les filtres par chaîne / catégorie / zone
---- dans la page de recherche
CREATE INDEX IF NOT EXISTS idx_hotel_chaine_categorie_zone
ON HOTEL (id_chaine, categorie, zone);


-- Index pour la recherche principale sur CHAMBRE
---- Utilité :
---- accélère les filtres par capacité / superficie / prix
---- dans la page de recherche
CREATE INDEX IF NOT EXISTS idx_chambre_capacite_superficie_prix
ON CHAMBRE (capacite, superficie, prix);


-- Index partiel sur les réservations actives
---- Utilité :
---- accélère la vérification de chevauchement pour
---- les chambres déjà réservées
CREATE INDEX IF NOT EXISTS idx_reservation_active_overlap
ON RESERVATION (id_hotel, num_chambre, date_debut, date_fin)
WHERE statut = 'confirmee';


-- Index partiel sur les locations actives
---- Utilité :
---- accélère la vérification de chevauchement pour
---- les chambres déjà louées
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_location_active_overlap
ON LOCATION (id_hotel, num_chambre, date_debut, date_fin)
WHERE statut = 'en_cours';


-- Index pour le choix des employés/gestionnaires
---- Utilité :
---- accélère les requêtes du type :
---- /api/employes?id_hotel=...&role=...
CREATE INDEX IF NOT EXISTS idx_employe_hotel_role
ON EMPLOYE (id_hotel, role);