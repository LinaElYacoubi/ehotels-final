-- TABLE CHAINE
CREATE TABLE CHAINE (
    id_chaine SERIAL PRIMARY KEY,
    nom_chaine VARCHAR(100) UNIQUE NOT NULL,
    adr_siege TEXT NOT NULL,
    nb_hotel INT DEFAULT 0 CHECK (nb_hotel >= 0)
);

-- TABLE HOTEL
CREATE TABLE HOTEL (
    id_hotel SERIAL PRIMARY KEY,
    id_chaine INT NOT NULL,
    nom_hotel VARCHAR(100) NOT NULL,
    categorie INT NOT NULL CHECK (categorie BETWEEN 1 AND 5),
    adresse TEXT NOT NULL,
    zone VARCHAR(100) NOT NULL,
    nb_chambre INT DEFAULT 0 CHECK (nb_chambre >= 0),
    UNIQUE (id_chaine, nom_hotel),
    FOREIGN KEY (id_chaine)
        REFERENCES CHAINE(id_chaine)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- TABLE CHAMBRE
CREATE TABLE CHAMBRE (
    id_hotel INT,
    num_chambre INT,
    prix DECIMAL NOT NULL CHECK (prix > 0),
    capacite VARCHAR(20) NOT NULL CHECK (
        capacite IN ('simple','double','triple','suite','familiale')
    ),
    superficie INT NOT NULL CHECK (superficie > 0),
    vue VARCHAR(20) NOT NULL CHECK (
        vue IN ('ville','mer','montagne','jardin','aucune')
    ),
    poss_ajout_lit BOOLEAN NOT NULL DEFAULT FALSE,
    etat VARCHAR(20) NOT NULL CHECK (
        etat IN ('disponible','occupee','maintenance','endommagee')
    ),
    PRIMARY KEY (id_hotel, num_chambre),
    FOREIGN KEY (id_hotel)
        REFERENCES HOTEL(id_hotel)
        ON DELETE CASCADE
);

-- TABLE CLIENT
CREATE TABLE CLIENT (
    id_client SERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    adresse TEXT NOT NULL,
    nas VARCHAR(20) UNIQUE NOT NULL,
    date_inscription DATE NOT NULL DEFAULT CURRENT_DATE
);

-- TABLE EMPLOYE
CREATE TABLE EMPLOYE (
    id_employe SERIAL PRIMARY KEY,
    id_hotel INT NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    adresse TEXT NOT NULL,
    nas VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (
        role IN ('gestionnaire','receptionniste','menage','maintenance','concierge')
    ),
    FOREIGN KEY (id_hotel)
        REFERENCES HOTEL(id_hotel)
        ON DELETE RESTRICT,
    UNIQUE (id_hotel, id_employe)
);

-- TABLE RESERVATION
CREATE TABLE RESERVATION (
    id_reservation SERIAL PRIMARY KEY,
    id_client INT NOT NULL,
    id_hotel INT,
    num_chambre INT,
    date_reservation DATE NOT NULL,
    date_debut DATE NOT NULL CHECK (
        date_debut < date_fin
    ),
    date_fin DATE NOT NULL,
    statut VARCHAR(30) NOT NULL CHECK (
        statut IN ('confirmee','annulee','convertie')
    ),
    FOREIGN KEY (id_client)
        REFERENCES CLIENT(id_client),
    FOREIGN KEY (id_hotel, num_chambre)
        REFERENCES CHAMBRE(id_hotel, num_chambre)
        ON DELETE SET NULL
);

-- TABLE LOCATION
-- TABLE LOCATION
CREATE TABLE LOCATION (
    id_location SERIAL PRIMARY KEY,
    id_client INT NOT NULL,
    id_hotel INT,
    num_chambre INT,
    source_location VARCHAR(30) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    date_checkin DATE,
    date_checkout DATE,
    id_reservation INT UNIQUE,
    id_employe INT,
    statut VARCHAR(30) NOT NULL,
    FOREIGN KEY (id_client)
        REFERENCES CLIENT(id_client),
    FOREIGN KEY (id_hotel, num_chambre)
        REFERENCES CHAMBRE(id_hotel, num_chambre)
        ON DELETE SET NULL,
    FOREIGN KEY (id_reservation)
        REFERENCES RESERVATION(id_reservation)
        ON DELETE RESTRICT,
    FOREIGN KEY (id_employe)
        REFERENCES EMPLOYE(id_employe)
        ON DELETE SET NULL,
    CHECK (source_location IN ('directe', 'apres_reservation')),
    CHECK (statut IN ('en_cours', 'terminee', 'annulee')),
    CHECK (date_debut < date_fin),
    CHECK (
        (source_location = 'directe' AND id_reservation IS NULL)
        OR
        (source_location = 'apres_reservation' AND id_reservation IS NOT NULL)
    ),
    CHECK (date_checkin IS NULL OR date_checkin >= date_debut),
    CHECK (date_checkout IS NULL OR date_checkin IS NOT NULL),
    CHECK (date_checkout IS NULL OR date_checkout > date_checkin),
    CHECK (date_checkout IS NULL OR date_checkout <= date_fin)
);

-- Table CHAINE_EMAIL
CREATE TABLE CHAINE_EMAIL (
    id_chaine INT,
    email VARCHAR(100),
    PRIMARY KEY (id_chaine, email),
    FOREIGN KEY (id_chaine)
        REFERENCES CHAINE(id_chaine)
        ON DELETE CASCADE
);


--Table CHAINE_TELEPHONE
CREATE TABLE CHAINE_TELEPHONE (
    id_chaine INT,
    telephone VARCHAR(20),
    PRIMARY KEY (id_chaine, telephone),
    FOREIGN KEY (id_chaine)
        REFERENCES CHAINE(id_chaine)
        ON DELETE CASCADE
);


--TABLE HOTEL_EMAIL
CREATE TABLE HOTEL_EMAIL (
    id_hotel INT,
    email VARCHAR(100),
    PRIMARY KEY (id_hotel, email),
    FOREIGN KEY (id_hotel)
        REFERENCES HOTEL(id_hotel)
        ON DELETE CASCADE
);

--TABLE HOTEL-TELEPHONE
CREATE TABLE HOTEL_TELEPHONE (
    id_hotel INT,
    telephone VARCHAR(20),
    PRIMARY KEY (id_hotel, telephone),
    FOREIGN KEY (id_hotel)
        REFERENCES HOTEL(id_hotel)
        ON DELETE CASCADE
);

-- TABLE COMMODITE
CREATE TABLE COMMODITE (
    id_commodite SERIAL PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL
);

--TABLE CHAMBRE_COMMODITE
CREATE TABLE CHAMBRE_COMMODITE (
    id_hotel INT,
    num_chambre INT,
    id_commodite INT,
    PRIMARY KEY (id_hotel, num_chambre, id_commodite),
    FOREIGN KEY (id_hotel, num_chambre)
        REFERENCES CHAMBRE(id_hotel, num_chambre)
        ON DELETE CASCADE,
    FOREIGN KEY (id_commodite)
        REFERENCES COMMODITE(id_commodite)
        ON DELETE CASCADE
);


--TABLE GESTION_HOTEL
CREATE TABLE GESTION_HOTEL (
    id_hotel INT PRIMARY KEY,
    id_employe INT UNIQUE NOT NULL,
    date_debut DATE NOT NULL,
    FOREIGN KEY (id_hotel)
        REFERENCES HOTEL(id_hotel)
        ON DELETE CASCADE,
    FOREIGN KEY (id_hotel, id_employe)
        REFERENCES EMPLOYE(id_hotel, id_employe)
        ON DELETE RESTRICT
);