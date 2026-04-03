-- 1
SELECT * FROM HOTEL WHERE zone = 'Ottawa';

-- 2
SELECT * FROM CHAMBRE WHERE prix <= 150;

-- 3
SELECT h.nom_hotel, COUNT(c.num_chambre)
FROM HOTEL h
JOIN CHAMBRE c ON h.id_hotel = c.id_hotel
GROUP BY h.nom_hotel;

-- 4
SELECT * FROM RESERVATION WHERE date_debut >= '2026-04-01';