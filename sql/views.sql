DROP VIEW IF EXISTS vue_chambres_disponibles_par_zone CASCADE;
DROP VIEW IF EXISTS vue_capacite_par_hotel CASCADE;

CREATE VIEW vue_chambres_disponibles_par_zone AS
SELECT
    h.zone,
    COUNT(*) AS nb_chambres_disponibles
FROM CHAMBRE c
JOIN HOTEL h
  ON h.id_hotel = c.id_hotel
WHERE c.etat = 'disponible'
  AND NOT EXISTS (
      SELECT 1
      FROM RESERVATION r
      WHERE r.id_hotel = c.id_hotel
        AND r.num_chambre = c.num_chambre
        AND r.statut = 'confirmee'
        AND CURRENT_DATE >= r.date_debut
        AND CURRENT_DATE < r.date_fin
  )
  AND NOT EXISTS (
      SELECT 1
      FROM LOCATION l
      WHERE l.id_hotel = c.id_hotel
        AND l.num_chambre = c.num_chambre
        AND l.statut = 'en_cours'
        AND CURRENT_DATE >= l.date_debut
        AND CURRENT_DATE < l.date_fin
  )
GROUP BY h.zone
ORDER BY h.zone;

CREATE VIEW vue_capacite_par_hotel AS
SELECT
    h.id_hotel,
    h.nom_hotel,
    h.zone,
    SUM(
        CASE c.capacite
            WHEN 'simple' THEN 1
            WHEN 'double' THEN 2
            WHEN 'triple' THEN 3
            WHEN 'suite' THEN 4
            WHEN 'familiale' THEN 5
            ELSE 0
        END
    ) AS capacite_totale
FROM HOTEL h
JOIN CHAMBRE c
  ON c.id_hotel = h.id_hotel
GROUP BY h.id_hotel, h.nom_hotel, h.zone
ORDER BY h.id_hotel;