-- CHAINE
-- 5 chaînes hôtelières  
INSERT INTO CHAINE (nom_chaine, adr_siege) VALUES
('Hilton', 'New York'),
('Marriott', 'Washington'),
('Hyatt', 'Chicago'),
('Sheraton', 'Boston'),
('Accor', 'Paris');

-- HOTELS 
---- ≥ 8 hôtels par chaîne  
-- ≥ 3 catégories d’hôtels  
-- ≥ 2 hôtels dans une même zone 

INSERT INTO HOTEL (id_chaine, nom_hotel, categorie, adresse, zone) VALUES

--  HILTON (id = 1)
(1, 'Hilton Ottawa Downtown', 5, '123 Main St', 'Ottawa'),
(1, 'Hilton Ottawa Airport', 4, 'Airport Rd', 'Ottawa'),
(1, 'Hilton Toronto Center', 5, 'King St', 'Toronto'),
(1, 'Hilton Toronto North', 3, 'North York', 'Toronto'),
(1, 'Hilton Montreal Old Port', 4, 'Old Port', 'Montreal'),
(1, 'Hilton Montreal East', 3, 'East End', 'Montreal'),
(1, 'Hilton Vancouver Bay', 5, 'Waterfront', 'Vancouver'),
(1, 'Hilton Calgary Plaza', 4, 'Downtown', 'Calgary'),

--  MARRIOTT (id = 2)
(2, 'Marriott Ottawa Center', 5, 'Elgin St', 'Ottawa'),
(2, 'Marriott Ottawa West', 3, 'Kanata', 'Ottawa'),
(2, 'Marriott Toronto Downtown', 5, 'Queen St', 'Toronto'),
(2, 'Marriott Toronto East', 4, 'Scarborough', 'Toronto'),
(2, 'Marriott Montreal Central', 4, 'Downtown', 'Montreal'),
(2, 'Marriott Montreal North', 3, 'Laval', 'Montreal'),
(2, 'Marriott Vancouver Central', 5, 'Granville', 'Vancouver'),
(2, 'Marriott Calgary West', 4, 'West End', 'Calgary'),

--  HYATT (id = 3)
(3, 'Hyatt Ottawa Downtown', 4, 'Rideau St', 'Ottawa'),
(3, 'Hyatt Ottawa East', 3, 'Orleans', 'Ottawa'),
(3, 'Hyatt Toronto Central', 5, 'Yonge St', 'Toronto'),
(3, 'Hyatt Toronto West', 3, 'Etobicoke', 'Toronto'),
(3, 'Hyatt Montreal Downtown', 4, 'St Catherine', 'Montreal'),
(3, 'Hyatt Montreal West', 3, 'West Island', 'Montreal'),
(3, 'Hyatt Vancouver Downtown', 5, 'Downtown', 'Vancouver'),
(3, 'Hyatt Calgary Center', 4, 'Center St', 'Calgary'),

--  SHERATON (id = 4)
(4, 'Sheraton Ottawa Downtown', 5, 'Bank St', 'Ottawa'),
(4, 'Sheraton Ottawa South', 3, 'South Keys', 'Ottawa'),
(4, 'Sheraton Toronto Center', 5, 'King West', 'Toronto'),
(4, 'Sheraton Toronto North', 4, 'North York', 'Toronto'),
(4, 'Sheraton Montreal Downtown', 4, 'Downtown', 'Montreal'),
(4, 'Sheraton Montreal East', 3, 'East', 'Montreal'),
(4, 'Sheraton Vancouver Center', 5, 'Downtown', 'Vancouver'),
(4, 'Sheraton Calgary South', 4, 'South', 'Calgary'),

--  ACCOR (id = 5)
(5, 'Accor Ottawa Central', 4, 'Rideau', 'Ottawa'),
(5, 'Accor Ottawa North', 3, 'Gatineau', 'Ottawa'),
(5, 'Accor Toronto Downtown', 5, 'Queen', 'Toronto'),
(5, 'Accor Toronto East', 3, 'East', 'Toronto'),
(5, 'Accor Montreal Central', 4, 'Downtown', 'Montreal'),
(5, 'Accor Montreal North', 3, 'North', 'Montreal'),
(5, 'Accor Vancouver Center', 5, 'Downtown', 'Vancouver'),
(5, 'Accor Calgary Downtown', 4, 'Downtown', 'Calgary');

-- CHAMBRES 
 --≥ 5 chambres par hôtel avec capacités variées  
INSERT INTO CHAMBRE (id_hotel, num_chambre, prix, capacite, superficie, vue, poss_ajout_lit, etat)
SELECT 
    h.id_hotel,
    100 + g.num,
    100,
    CASE g.num
        WHEN 1 THEN 'simple'
        WHEN 2 THEN 'double'
        WHEN 3 THEN 'triple'
        WHEN 4 THEN 'suite'
        WHEN 5 THEN 'familiale'
    END,
    20,
    'ville',
    TRUE,
    'disponible'
FROM HOTEL h
CROSS JOIN (SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) g;