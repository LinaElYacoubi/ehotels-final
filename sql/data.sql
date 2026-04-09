-- CHAÎNES

INSERT INTO CHAINE (nom_chaine, adr_siege) VALUES
('Hilton',   'New York'),
('Marriott', 'Washington'),
('Hyatt',    'Chicago'),
('Sheraton', 'Boston'),
('Accor',    'Paris');



-- CONTACTS DES CHAÎNES

INSERT INTO CHAINE_EMAIL (id_chaine, email) VALUES
(1, 'contact@hilton.com'),
(1, 'support@hilton.com'),
(2, 'contact@marriott.com'),
(2, 'support@marriott.com'),
(3, 'contact@hyatt.com'),
(3, 'support@hyatt.com'),
(4, 'contact@sheraton.com'),
(4, 'support@sheraton.com'),
(5, 'contact@accor.com'),
(5, 'support@accor.com');

INSERT INTO CHAINE_TELEPHONE (id_chaine, telephone) VALUES
(1, '+1-212-555-0101'),
(1, '+1-212-555-0102'),
(2, '+1-202-555-0201'),
(2, '+1-202-555-0202'),
(3, '+1-312-555-0301'),
(3, '+1-312-555-0302'),
(4, '+1-617-555-0401'),
(4, '+1-617-555-0402'),
(5, '+33-1-555-0501'),
(5, '+33-1-555-0502');



-- HÔTELS
---- 8 hôtels par chaîne = 40 hôtels
---- au moins 3 catégories
---- au moins 2 hôtels dans une même zone

INSERT INTO HOTEL (id_chaine, nom_hotel, categorie, adresse, zone) VALUES

-- HILTON (1)
(1, 'Hilton Ottawa Downtown',   5, '123 Main St',      'Ottawa'),
(1, 'Hilton Ottawa Airport',    4, 'Airport Rd',       'Ottawa'),
(1, 'Hilton Toronto Center',    5, 'King St',          'Toronto'),
(1, 'Hilton Toronto North',     3, 'North York',       'Toronto'),
(1, 'Hilton Montreal Old Port', 4, 'Old Port',         'Montreal'),
(1, 'Hilton Montreal East',     3, 'East End',         'Montreal'),
(1, 'Hilton Vancouver Bay',     5, 'Waterfront',       'Vancouver'),
(1, 'Hilton Calgary Plaza',     4, 'Downtown',         'Calgary'),

-- MARRIOTT (2)
(2, 'Marriott Ottawa Center',    5, 'Elgin St',        'Ottawa'),
(2, 'Marriott Ottawa West',      3, 'Kanata',          'Ottawa'),
(2, 'Marriott Toronto Downtown', 5, 'Queen St',        'Toronto'),
(2, 'Marriott Toronto East',     4, 'Scarborough',     'Toronto'),
(2, 'Marriott Montreal Central', 4, 'Downtown',        'Montreal'),
(2, 'Marriott Montreal North',   3, 'Laval',           'Montreal'),
(2, 'Marriott Vancouver Central',5, 'Granville',       'Vancouver'),
(2, 'Marriott Calgary West',     4, 'West End',        'Calgary'),

-- HYATT (3)
(3, 'Hyatt Ottawa Downtown',    4, 'Rideau St',        'Ottawa'),
(3, 'Hyatt Ottawa East',        3, 'Orleans',          'Ottawa'),
(3, 'Hyatt Toronto Central',    5, 'Yonge St',         'Toronto'),
(3, 'Hyatt Toronto West',       3, 'Etobicoke',        'Toronto'),
(3, 'Hyatt Montreal Downtown',  4, 'St Catherine',     'Montreal'),
(3, 'Hyatt Montreal West',      3, 'West Island',      'Montreal'),
(3, 'Hyatt Vancouver Downtown', 5, 'Downtown',         'Vancouver'),
(3, 'Hyatt Calgary Center',     4, 'Center St',        'Calgary'),

-- SHERATON (4)
(4, 'Sheraton Ottawa Downtown',   5, 'Bank St',        'Ottawa'),
(4, 'Sheraton Ottawa South',      3, 'South Keys',     'Ottawa'),
(4, 'Sheraton Toronto Center',    5, 'King West',      'Toronto'),
(4, 'Sheraton Toronto North',     4, 'North York',     'Toronto'),
(4, 'Sheraton Montreal Downtown', 4, 'Downtown',       'Montreal'),
(4, 'Sheraton Montreal East',     3, 'East',           'Montreal'),
(4, 'Sheraton Vancouver Center',  5, 'Downtown',       'Vancouver'),
(4, 'Sheraton Calgary South',     4, 'South',          'Calgary'),

-- ACCOR (5)
(5, 'Accor Ottawa Central',     4, 'Rideau',           'Ottawa'),
(5, 'Accor Ottawa North',       3, 'Gatineau',         'Ottawa'),
(5, 'Accor Toronto Downtown',   5, 'Queen',            'Toronto'),
(5, 'Accor Toronto East',       3, 'East',             'Toronto'),
(5, 'Accor Montreal Central',   4, 'Downtown',         'Montreal'),
(5, 'Accor Montreal North',     3, 'North',            'Montreal'),
(5, 'Accor Vancouver Center',   5, 'Downtown',         'Vancouver'),
(5, 'Accor Calgary Downtown',   4, 'Downtown',         'Calgary');



-- CONTACTS DES HÔTELS

INSERT INTO HOTEL_EMAIL (id_hotel, email)
SELECT id_hotel, lower(replace(nom_hotel, ' ', '.')) || '@ehotels.com'
FROM HOTEL;

INSERT INTO HOTEL_TELEPHONE (id_hotel, telephone)
SELECT id_hotel, '+1-613-555-' || LPAD(id_hotel::text, 4, '0')
FROM HOTEL;



-- COMMODITÉS

INSERT INTO COMMODITE (nom) VALUES
('WiFi'),
('TV'),
('Climatisation'),
('Mini-bar'),
('Balcon'),
('Cuisine'),
('Jacuzzi'),
('Vue panoramique');



-- CHAMBRES
---- 5 chambres par hôtel avec capacités variées

INSERT INTO CHAMBRE (
    id_hotel, num_chambre, prix, capacite, superficie, vue, poss_ajout_lit, etat
)
SELECT
    h.id_hotel,
    100 + g.num,
    CASE g.num
        WHEN 1 THEN 110
        WHEN 2 THEN 145
        WHEN 3 THEN 180
        WHEN 4 THEN 260
        WHEN 5 THEN 320
    END + (h.categorie * 10),
    CASE g.num
        WHEN 1 THEN 'simple'
        WHEN 2 THEN 'double'
        WHEN 3 THEN 'triple'
        WHEN 4 THEN 'suite'
        WHEN 5 THEN 'familiale'
    END,
    CASE g.num
        WHEN 1 THEN 18
        WHEN 2 THEN 24
        WHEN 3 THEN 30
        WHEN 4 THEN 40
        WHEN 5 THEN 48
    END,
    CASE g.num
        WHEN 1 THEN 'ville'
        WHEN 2 THEN 'jardin'
        WHEN 3 THEN 'montagne'
        WHEN 4 THEN 'aucune'
        WHEN 5 THEN 'ville'
    END,
    CASE
        WHEN g.num IN (2,3,5) THEN TRUE
        ELSE FALSE
    END,
    'disponible'
FROM HOTEL h
CROSS JOIN (
    SELECT 1 AS num
    UNION SELECT 2
    UNION SELECT 3
    UNION SELECT 4
    UNION SELECT 5
) g;



-- COMMODITÉS DES CHAMBRES

-- Toutes les chambres ont WiFi + TV
INSERT INTO CHAMBRE_COMMODITE (id_hotel, num_chambre, id_commodite)
SELECT c.id_hotel, c.num_chambre, co.id_commodite
FROM CHAMBRE c
JOIN COMMODITE co ON co.nom IN ('WiFi', 'TV');

-- Double / triple / familiale : climatisation
INSERT INTO CHAMBRE_COMMODITE (id_hotel, num_chambre, id_commodite)
SELECT c.id_hotel, c.num_chambre, co.id_commodite
FROM CHAMBRE c
JOIN COMMODITE co ON co.nom = 'Climatisation'
WHERE c.capacite IN ('double', 'triple', 'familiale');

-- Suites : mini-bar + jacuzzi + vue panoramique
INSERT INTO CHAMBRE_COMMODITE (id_hotel, num_chambre, id_commodite)
SELECT c.id_hotel, c.num_chambre, co.id_commodite
FROM CHAMBRE c
JOIN COMMODITE co ON co.nom IN ('Mini-bar', 'Jacuzzi', 'Vue panoramique')
WHERE c.capacite = 'suite';

-- Familiales : cuisine + balcon
INSERT INTO CHAMBRE_COMMODITE (id_hotel, num_chambre, id_commodite)
SELECT c.id_hotel, c.num_chambre, co.id_commodite
FROM CHAMBRE c
JOIN COMMODITE co ON co.nom IN ('Cuisine', 'Balcon')
WHERE c.capacite = 'familiale';



-- CLIENTS

INSERT INTO CLIENT (nom, prenom, adresse, nas, date_inscription) VALUES
('Tremblay', 'Sophie',   '12 Rue Elgin, Ottawa',         'NAS-CLI-0001', '2026-01-10'),
('Nguyen',   'Alex',     '45 King St, Toronto',          'NAS-CLI-0002', '2026-01-11'),
('Martin',   'Lea',      '88 St Catherine, Montreal',    'NAS-CLI-0003', '2026-01-12'),
('Roy',      'Samuel',   '34 Granville, Vancouver',      'NAS-CLI-0004', '2026-01-13'),
('Gagnon',   'Nadia',    '90 Center St, Calgary',        'NAS-CLI-0005', '2026-01-14'),
('Bouchard', 'Karim',    '19 Rideau, Ottawa',            'NAS-CLI-0006', '2026-01-15'),
('Lopez',    'Maya',     '22 Queen St, Toronto',         'NAS-CLI-0007', '2026-01-16'),
('Diallo',   'Amin',     '73 Downtown, Montreal',        'NAS-CLI-0008', '2026-01-17');



-- EMPLOYÉS
---- 5 employés par hôtel, dont 1 gestionnaire

INSERT INTO EMPLOYE (id_hotel, nom, prenom, adresse, nas, role)
SELECT
    h.id_hotel,
    CASE g.num
        WHEN 1 THEN 'Gestionnaire'
        WHEN 2 THEN 'Reception'
        WHEN 3 THEN 'Menage'
        WHEN 4 THEN 'Maintenance'
        WHEN 5 THEN 'Concierge'
    END || '_' || h.id_hotel,
    CASE g.num
        WHEN 1 THEN 'Marie'
        WHEN 2 THEN 'Luc'
        WHEN 3 THEN 'Nora'
        WHEN 4 THEN 'Adam'
        WHEN 5 THEN 'Sara'
    END,
    h.adresse || ', ' || h.zone,
    'NAS-EMP-' || LPAD(h.id_hotel::text, 3, '0') || '-' || g.num,
    CASE g.num
        WHEN 1 THEN 'gestionnaire'
        WHEN 2 THEN 'receptionniste'
        WHEN 3 THEN 'menage'
        WHEN 4 THEN 'maintenance'
        WHEN 5 THEN 'concierge'
    END
FROM HOTEL h
CROSS JOIN (
    SELECT 1 AS num
    UNION SELECT 2
    UNION SELECT 3
    UNION SELECT 4
    UNION SELECT 5
) g;



-- GESTION_HOTEL
---- 1 gestionnaire par hôtel

INSERT INTO GESTION_HOTEL (id_hotel, id_employe, date_debut)
SELECT e.id_hotel, e.id_employe, DATE '2026-01-01'
FROM EMPLOYE e
WHERE e.role = 'gestionnaire';



-- RÉSERVATIONS
---- Quelques réservations cohérentes

INSERT INTO RESERVATION (
    id_client, id_hotel, num_chambre, date_reservation, date_debut, date_fin, statut
) VALUES
(1, 1, 101, '2026-03-01', '2026-05-01', '2026-05-05', 'confirmee'),
(2, 3, 102, '2026-03-02', '2026-05-10', '2026-05-14', 'annulee'),
(3, 5, 103, '2026-03-03', '2026-05-20', '2026-05-25', 'convertie'),
(4, 9, 104, '2026-03-04', '2026-06-01', '2026-06-03', 'confirmee'),
(5, 12, 105, '2026-03-05', '2026-06-10', '2026-06-15', 'confirmee');



-- LOCATIONS
---- 1 location après réservation
---- 2 locations directes

-- location après réservation (réservation 3 déjà convertie)
INSERT INTO LOCATION (
    id_client, id_hotel, num_chambre,
    source_location, date_debut, date_fin,
    date_checkin, date_checkout,
    id_reservation, id_employe, statut
) VALUES
(
    3, 5, 103,
    'apres_reservation', '2026-05-20', '2026-05-25',
    '2026-05-20', '2026-05-25',
    3, 21, 'terminee'
);

-- location directe en cours
INSERT INTO LOCATION (
    id_client, id_hotel, num_chambre,
    source_location, date_debut, date_fin,
    date_checkin, date_checkout,
    id_reservation, id_employe, statut
) VALUES
(
    6, 2, 104,
    'directe', '2026-06-20', '2026-06-24',
    '2026-06-20', NULL,
    NULL, 7, 'en_cours'
);

-- location directe terminée
INSERT INTO LOCATION (
    id_client, id_hotel, num_chambre,
    source_location, date_debut, date_fin,
    date_checkin, date_checkout,
    id_reservation, id_employe, statut
) VALUES
(
    7, 10, 101,
    'directe', '2026-04-01', '2026-04-04',
    '2026-04-01', '2026-04-04',
    NULL, 47, 'terminee'
);