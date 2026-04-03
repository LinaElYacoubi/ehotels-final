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
    vue VARCHAR(20) NOT NULL,
    poss_ajout_lit BOOLEAN,
    etat VARCHAR(20) NOT NULL,
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
    date_inscription DATE NOT NULL
);

-- TABLE EMPLOYE
CREATE TABLE EMPLOYE (
    id_employe SERIAL PRIMARY KEY,
    id_hotel INT NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    adresse TEXT NOT NULL,
    nas VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    FOREIGN KEY (id_hotel)
        REFERENCES HOTEL(id_hotel)
        ON DELETE RESTRICT
);

-- TABLE RESERVATION
CREATE TABLE RESERVATION (
    id_reservation SERIAL PRIMARY KEY,
    id_client INT NOT NULL,
    id_hotel INT,
    num_chambre INT,
    date_reservation DATE NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut VARCHAR(30) NOT NULL,
    FOREIGN KEY (id_client)
        REFERENCES CLIENT(id_client),
    FOREIGN KEY (id_hotel, num_chambre)
        REFERENCES CHAMBRE(id_hotel, num_chambre)
        ON DELETE SET NULL
);

-- TABLE LOCATION
CREATE TABLE LOCATION (
    id_location SERIAL PRIMARY KEY,
    id_client INT NOT NULL,
    id_hotel INT,
    num_chambre INT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    statut VARCHAR(30) NOT NULL,
    FOREIGN KEY (id_client)
        REFERENCES CLIENT(id_client),
    FOREIGN KEY (id_hotel, num_chambre)
        REFERENCES CHAMBRE(id_hotel, num_chambre)
        ON DELETE SET NULL
);