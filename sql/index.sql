CREATE INDEX idx_hotel_zone ON HOTEL(zone);
CREATE INDEX idx_chambre_prix ON CHAMBRE(prix);
CREATE INDEX idx_reservation_dates ON RESERVATION(date_debut, date_fin);