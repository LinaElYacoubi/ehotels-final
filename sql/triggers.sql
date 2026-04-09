-- TRIGGER 1 : nb_hotel

DROP TRIGGER IF EXISTS trigger_nb_hotel ON HOTEL;
DROP FUNCTION IF EXISTS maj_nb_hotel();

CREATE OR REPLACE FUNCTION maj_nb_hotel()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE CHAINE
        SET nb_hotel = nb_hotel + 1
        WHERE id_chaine = NEW.id_chaine;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE CHAINE
        SET nb_hotel = nb_hotel - 1
        WHERE id_chaine = OLD.id_chaine;

    ELSIF TG_OP = 'UPDATE' AND NEW.id_chaine IS DISTINCT FROM OLD.id_chaine THEN
        UPDATE CHAINE
        SET nb_hotel = nb_hotel - 1
        WHERE id_chaine = OLD.id_chaine;

        UPDATE CHAINE
        SET nb_hotel = nb_hotel + 1
        WHERE id_chaine = NEW.id_chaine;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_hotel
AFTER INSERT OR DELETE OR UPDATE OF id_chaine ON HOTEL
FOR EACH ROW
EXECUTE FUNCTION maj_nb_hotel();



-- TRIGGER 2 : nb_chambre

DROP TRIGGER IF EXISTS trigger_nb_chambre ON CHAMBRE;
DROP FUNCTION IF EXISTS maj_nb_chambre();

CREATE OR REPLACE FUNCTION maj_nb_chambre()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE HOTEL
        SET nb_chambre = nb_chambre + 1
        WHERE id_hotel = NEW.id_hotel;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE HOTEL
        SET nb_chambre = nb_chambre - 1
        WHERE id_hotel = OLD.id_hotel;

    ELSIF TG_OP = 'UPDATE' AND NEW.id_hotel IS DISTINCT FROM OLD.id_hotel THEN
        UPDATE HOTEL
        SET nb_chambre = nb_chambre - 1
        WHERE id_hotel = OLD.id_hotel;

        UPDATE HOTEL
        SET nb_chambre = nb_chambre + 1
        WHERE id_hotel = NEW.id_hotel;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nb_chambre
AFTER INSERT OR DELETE OR UPDATE OF id_hotel ON CHAMBRE
FOR EACH ROW
EXECUTE FUNCTION maj_nb_chambre();



-- TRIGGER 3 : overlap réservation

DROP TRIGGER IF EXISTS trigger_check_reservation ON RESERVATION;
DROP FUNCTION IF EXISTS check_reservation_overlap();

CREATE OR REPLACE FUNCTION check_reservation_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.statut NOT IN ('annulee', 'convertie') THEN

        IF EXISTS (
            SELECT 1
            FROM RESERVATION r
            WHERE r.id_hotel = NEW.id_hotel
              AND r.num_chambre = NEW.num_chambre
              AND r.id_reservation <> COALESCE(NEW.id_reservation, -1)
              AND r.statut NOT IN ('annulee', 'convertie')
              AND NEW.date_debut < r.date_fin
              AND NEW.date_fin > r.date_debut
        ) THEN
            RAISE EXCEPTION 'Chevauchement de réservation interdit';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM LOCATION l
            WHERE l.id_hotel = NEW.id_hotel
              AND l.num_chambre = NEW.num_chambre
              AND l.statut NOT IN ('terminee', 'annulee')
              AND NEW.date_debut < l.date_fin
              AND NEW.date_fin > l.date_debut
        ) THEN
            RAISE EXCEPTION 'Chevauchement interdit avec une location existante';
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_reservation
BEFORE INSERT OR UPDATE ON RESERVATION
FOR EACH ROW
EXECUTE FUNCTION check_reservation_overlap();



-- TRIGGER 4 : overlap location

DROP TRIGGER IF EXISTS trigger_check_location ON LOCATION;
DROP FUNCTION IF EXISTS check_location_overlap();

CREATE OR REPLACE FUNCTION check_location_overlap()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.statut NOT IN ('terminee', 'annulee') THEN

        IF EXISTS (
            SELECT 1
            FROM LOCATION l
            WHERE l.id_hotel = NEW.id_hotel
              AND l.num_chambre = NEW.num_chambre
              AND l.id_location <> COALESCE(NEW.id_location, -1)
              AND l.statut NOT IN ('terminee', 'annulee')
              AND NEW.date_debut < l.date_fin
              AND NEW.date_fin > l.date_debut
        ) THEN
            RAISE EXCEPTION 'Chevauchement de location interdit';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM RESERVATION r
            WHERE r.id_hotel = NEW.id_hotel
              AND r.num_chambre = NEW.num_chambre
              AND r.id_reservation <> COALESCE(NEW.id_reservation, -1)
              AND r.statut NOT IN ('annulee', 'convertie')
              AND NEW.date_debut < r.date_fin
              AND NEW.date_fin > r.date_debut
        ) THEN
            RAISE EXCEPTION 'Chevauchement interdit avec une réservation existante';
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_location
BEFORE INSERT OR UPDATE ON LOCATION
FOR EACH ROW
EXECUTE FUNCTION check_location_overlap();



-- TRIGGER 5 : valisation du gestionnaire d'hotel

-- TRIGGER 5 : validation du gestionnaire d'hotel

DROP TRIGGER IF EXISTS trigger_check_gestion_hotel ON GESTION_HOTEL;
DROP FUNCTION IF EXISTS check_gestion_hotel();

CREATE OR REPLACE FUNCTION check_gestion_hotel()
RETURNS TRIGGER AS $$
DECLARE
    v_role EMPLOYE.role%TYPE;
    v_id_hotel EMPLOYE.id_hotel%TYPE;
BEGIN
    SELECT role, id_hotel
    INTO v_role, v_id_hotel
    FROM EMPLOYE
    WHERE id_employe = NEW.id_employe;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Employé introuvable';
    END IF;

    IF v_role <> 'gestionnaire' THEN
        RAISE EXCEPTION 'L''employé référencé doit avoir le rôle gestionnaire';
    END IF;

    IF v_id_hotel <> NEW.id_hotel THEN
        RAISE EXCEPTION 'Le gestionnaire doit travailler dans le même hôtel';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_gestion_hotel
BEFORE INSERT OR UPDATE ON GESTION_HOTEL
FOR EACH ROW
EXECUTE FUNCTION check_gestion_hotel();