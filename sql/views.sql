-- VUE 1 : Nombre de chambres disponibles par zone
-- Affiche le nombre de chambres actuellement disponibles (non réservées / non louées)  dans chaque zone géographique.
-- Une chambre est considérée indisponible si elle a une RESERVATION ou LOCATION active
-- dou les dates incluent la date d'aujourd'hui.

CREATE OR REPLACE VIEW vue_chambres_disponibles_par_zone AS
SELECT
    h.zone,
    COUNT(*) AS nb_chambres_disponibles
FROM CHAMBRE c
JOIN HOTEL h ON c.id_hotel = h.id_hotel
WHERE NOT EXISTS (
    SELECT 1 FROM RESERVATION r
    WHERE r.id_hotel = c.id_hotel
      AND r.num_chambre = c.num_chambre
      AND r.statut NOT IN ('annulee', 'convertie')
      AND CURRENT_DATE BETWEEN r.date_debut AND r.date_fin
)
AND NOT EXISTS (
    SELECT 1 FROM LOCATION l
    WHERE l.id_hotel = c.id_hotel
      AND l.num_chambre = c.num_chambre
      AND l.statut NOT IN ('terminee', 'annulee')
      AND CURRENT_DATE BETWEEN l.date_debut AND l.date_fin
)
GROUP BY h.zone
ORDER BY h.zone;


-- VUE 2 : Capacité totale des chambres par hôtel
-- Affiche le nombre total de chambres par hôtel, en décomposition par le type de capacité.
CREATE OR REPLACE VIEW vue_capacite_par_hotel AS
SELECT
    h.id_hotel,
    h.nom_hotel,
    h.zone,
    h.categorie,
    COUNT(*) AS nb_total_chambres,
    COUNT(*) FILTER (WHERE c.capacite = 'simple')    AS nb_simple,
    COUNT(*) FILTER (WHERE c.capacite = 'double')    AS nb_double,
    COUNT(*) FILTER (WHERE c.capacite = 'triple')    AS nb_triple,
    COUNT(*) FILTER (WHERE c.capacite = 'suite')     AS nb_suite,
    COUNT(*) FILTER (WHERE c.capacite = 'familiale') AS nb_familiale
FROM HOTEL h
JOIN CHAMBRE c ON h.id_hotel = c.id_hotel
GROUP BY h.id_hotel, h.nom_hotel, h.zone, h.categorie
ORDER BY h.id_hotel;
