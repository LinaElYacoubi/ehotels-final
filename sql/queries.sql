-- Recherche de chambres disponibles pour une période avec filtres combinés
SELECT
    c.id_hotel,
    c.num_chambre,
    c.prix,
    c.capacite,
    c.superficie,
    c.vue,
    c.poss_ajout_lit,
    h.nom_hotel,
    h.zone,
    h.categorie,
    ch.nom_chaine
FROM CHAMBRE c
JOIN HOTEL h ON h.id_hotel = c.id_hotel
JOIN CHAINE ch ON ch.id_chaine = h.id_chaine
WHERE c.capacite = 'double'
  AND c.superficie >= 20
  AND c.prix <= 220
  AND h.id_chaine = 1
  AND h.categorie >= 4
  AND NOT EXISTS (
      SELECT 1
      FROM RESERVATION r
      WHERE r.id_hotel = c.id_hotel
        AND r.num_chambre = c.num_chambre
        AND r.statut NOT IN ('annulee', 'convertie')
        AND DATE '2026-06-10' < r.date_fin
        AND DATE '2026-06-15' > r.date_debut
  )
  AND NOT EXISTS (
      SELECT 1
      FROM LOCATION l
      WHERE l.id_hotel = c.id_hotel
        AND l.num_chambre = c.num_chambre
        AND l.statut NOT IN ('terminee', 'annulee')
        AND DATE '2026-06-10' < l.date_fin
        AND DATE '2026-06-15' > l.date_debut
  )
ORDER BY c.prix ASC;


-- Nombre de réservations par hôtel
SELECT
    h.id_hotel,
    h.nom_hotel,
    COUNT(r.id_reservation) AS nb_reservations
FROM HOTEL h
LEFT JOIN RESERVATION r
  ON r.id_hotel = h.id_hotel
GROUP BY h.id_hotel, h.nom_hotel
ORDER BY nb_reservations DESC, h.nom_hotel;


-- Insertion d’une réservation
INSERT INTO RESERVATION (
    id_client,
    id_hotel,
    num_chambre,
    date_reservation,
    date_debut,
    date_fin,
    statut
)
VALUES (
    1,
    1,
    102,
    CURRENT_DATE,
    DATE '2026-07-01',
    DATE '2026-07-05',
    'confirmee'
);


-- Mise à jour : annuler une réservation
UPDATE RESERVATION
SET statut = 'annulee'
WHERE id_reservation = 1;


-- Suppression : enlever un email de contact d’hôtel
DELETE FROM HOTEL_EMAIL
WHERE id_hotel = 1
  AND email = (
      SELECT email
      FROM HOTEL_EMAIL
      WHERE id_hotel = 1
      LIMIT 1
  );


-- Liste des gestionnaires avec leur hôtel
SELECT
    e.id_employe,
    e.prenom,
    e.nom,
    e.role,
    h.id_hotel,
    h.nom_hotel,
    h.zone
FROM GESTION_HOTEL gh
JOIN EMPLOYE e
  ON e.id_employe = gh.id_employe
JOIN HOTEL h
  ON h.id_hotel = gh.id_hotel
ORDER BY h.nom_hotel;


-- Historique combiné des réservations converties et des locations correspondantes
SELECT
    r.id_reservation,
    r.id_client,
    r.id_hotel,
    r.num_chambre,
    r.date_debut AS reservation_debut,
    r.date_fin   AS reservation_fin,
    l.id_location,
    l.date_checkin,
    l.date_checkout,
    l.statut AS statut_location
FROM RESERVATION r
JOIN LOCATION l
  ON l.id_reservation = r.id_reservation
WHERE r.statut = 'convertie'
ORDER BY r.id_reservation;