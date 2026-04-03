-- TRIGGER 1 : nb_hotel
CREATE OR REPLACE FUNCTION maj_nb_hotel()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE CHAINE SET nb_hotel = nb_hotel + 1 WHERE id_chaine = NEW.id_chaine;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE CHAINE SET nb_hotel = nb_hotel - 1 WHERE id_chaine = OLD.id_chaine;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_hotel
AFTER INSERT OR DELETE ON HOTEL
FOR EACH ROW
EXECUTE FUNCTION maj_nb_hotel();

-- TRIGGER 2 :  nb_chambre
CREATE OR REPLACE FUNCTION maj_nb_chambre()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE HOTEL SET nb_chambre = nb_chambre + 1 WHERE id_hotel = NEW.id_hotel;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE HOTEL SET nb_chambre = nb_chambre - 1 WHERE id_hotel = OLD.id_hotel;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_chambre
AFTER INSERT OR DELETE ON CHAMBRE
FOR EACH ROW
EXECUTE FUNCTION maj_nb_chambre();


-- TRIGGER 3 
CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM RESERVATION r
        WHERE r.id_hotel = NEW.id_hotel
        AND r.num_chambre = NEW.num_chambre
        AND r.id_reservation != COALESCE(NEW.id_reservation, -1)
        AND (
            NEW.date_debut < r.date_fin
            AND NEW.date_fin > r.date_debut
        )
    ) THEN
        RAISE EXCEPTION 'Chevauchement de réservation interdit';
    END IF;

    RETURN NEW;
END;

CREATE TRIGGER trigger_check_reservation
BEFORE INSERT OR UPDATE ON RESERVATION
FOR EACH ROW
EXECUTE FUNCTION check_reservation_overlap();


--TRIGGER 4
CREATE OR REPLACE FUNCTION check_location_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM LOCATION l
        WHERE l.id_hotel = NEW.id_hotel
        AND l.num_chambre = NEW.num_chambre
        AND l.id_location != COALESCE(NEW.id_location, -1)
        AND (
            NEW.date_debut < l.date_fin
            AND NEW.date_fin > l.date_debut
        )
    ) THEN
        RAISE EXCEPTION 'Chevauchement de location interdit';
    END IF;

    RETURN NEW;
END;

CREATE TRIGGER trigger_check_location
BEFORE INSERT OR UPDATE ON LOCATION
FOR EACH ROW
EXECUTE FUNCTION check_location_overlap();