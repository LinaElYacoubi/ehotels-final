function getDbErrorMessage(err) {
  const code = err.code || '';
  const constraint = err.constraint || '';
  const message = err.message || '';

  // CHECK constraints
  if (code === '23514') {
    switch (constraint) {
      // HOTEL
      case 'hotel_categorie_check':
        return "Impossible : la catégorie de l'hôtel doit être comprise entre 1 et 5.";
      case 'hotel_nb_chambre_check':
        return "Impossible : le nombre de chambres d'un hôtel ne peut pas être négatif.";

      // CHAINE
      case 'chaine_nb_hotel_check':
        return "Impossible : le nombre d'hôtels d'une chaîne ne peut pas être négatif.";

      // CHAMBRE
      case 'chambre_prix_check':
        return "Impossible : le prix de la chambre doit être supérieur à 0.";
      case 'chambre_superficie_check':
        return "Impossible : la superficie de la chambre doit être supérieure à 0.";
      case 'chambre_capacite_check':
        return "Impossible : la capacité de la chambre est invalide.";
      case 'chambre_vue_check':
        return "Impossible : la vue sélectionnée pour la chambre est invalide.";
      case 'chambre_etat_check':
        return "Impossible : l'état de la chambre est invalide.";

      // EMPLOYE
      case 'employe_role_check':
        return "Impossible : le rôle de l'employé est invalide.";

      // RESERVATION
      case 'reservation_check':
        return "Impossible de créer ou modifier cette réservation : la date de début doit être avant la date de fin.";
      case 'reservation_statut_check':
        return "Impossible : le statut de la réservation est invalide.";

      // LOCATION
      case 'location_check':
        return "Impossible de créer ou modifier cette location : la date de début doit être avant la date de fin.";
      case 'location_check1':
        return "Impossible : une location directe ne doit pas avoir de réservation associée, et une location après réservation doit obligatoirement avoir une réservation associée.";
      case 'location_check2':
        return "Impossible de faire le check-in avant la date de début prévue de la location.";
      case 'location_check3':
        return "Impossible de faire le check-out : aucun check-in n'a encore été enregistré pour cette location.";
      case 'location_check4':
        return "Impossible de faire le check-out : la date de départ doit être après la date de check-in.";
      case 'location_check5':
        return "Impossible de faire le check-out après la date de fin prévue de la location.";
      case 'location_source_location_check':
        return "Impossible : l'origine de la location est invalide.";
      case 'location_statut_check':
        return "Impossible : le statut de la location est invalide.";

      default:
        return "Action impossible : une contrainte de validation de la base de données bloque l'opération.";
    }
  }

  // NOT NULL
  if (code === '23502') {
    switch (constraint) {
      case 'chaine_nom_chaine_not_null':
        return "Impossible : le nom de la chaîne est obligatoire.";
      case 'chaine_adr_siege_not_null':
        return "Impossible : l'adresse du siège social est obligatoire.";

      case 'hotel_id_chaine_not_null':
        return "Impossible : une chaîne doit être sélectionnée pour l'hôtel.";
      case 'hotel_nom_hotel_not_null':
        return "Impossible : le nom de l'hôtel est obligatoire.";
      case 'hotel_categorie_not_null':
        return "Impossible : la catégorie de l'hôtel est obligatoire.";
      case 'hotel_adresse_not_null':
        return "Impossible : l'adresse de l'hôtel est obligatoire.";
      case 'hotel_zone_not_null':
        return "Impossible : la zone de l'hôtel est obligatoire.";

      case 'chambre_id_hotel_not_null':
        return "Impossible : l'hôtel de la chambre est obligatoire.";
      case 'chambre_num_chambre_not_null':
        return "Impossible : le numéro de chambre est obligatoire.";
      case 'chambre_prix_not_null':
        return "Impossible : le prix de la chambre est obligatoire.";
      case 'chambre_capacite_not_null':
        return "Impossible : la capacité de la chambre est obligatoire.";
      case 'chambre_superficie_not_null':
        return "Impossible : la superficie de la chambre est obligatoire.";
      case 'chambre_vue_not_null':
        return "Impossible : la vue de la chambre est obligatoire.";
      case 'chambre_poss_ajout_lit_not_null':
        return "Impossible : veuillez préciser si un lit supplémentaire est possible.";
      case 'chambre_etat_not_null':
        return "Impossible : l'état de la chambre est obligatoire.";

      case 'client_nom_not_null':
        return "Impossible : le nom du client est obligatoire.";
      case 'client_prenom_not_null':
        return "Impossible : le prénom du client est obligatoire.";
      case 'client_adresse_not_null':
        return "Impossible : l'adresse du client est obligatoire.";
      case 'client_nas_not_null':
        return "Impossible : le NAS du client est obligatoire.";
      case 'client_date_inscription_not_null':
        return "Impossible : la date d'inscription du client est obligatoire.";

      case 'employe_id_hotel_not_null':
        return "Impossible : l'hôtel de l'employé est obligatoire.";
      case 'employe_nom_not_null':
        return "Impossible : le nom de l'employé est obligatoire.";
      case 'employe_prenom_not_null':
        return "Impossible : le prénom de l'employé est obligatoire.";
      case 'employe_adresse_not_null':
        return "Impossible : l'adresse de l'employé est obligatoire.";
      case 'employe_nas_not_null':
        return "Impossible : le NAS de l'employé est obligatoire.";
      case 'employe_role_not_null':
        return "Impossible : le rôle de l'employé est obligatoire.";

      case 'reservation_id_client_not_null':
        return "Impossible : le client de la réservation est obligatoire.";
      case 'reservation_date_reservation_not_null':
        return "Impossible : la date de réservation est obligatoire.";
      case 'reservation_date_debut_not_null':
        return "Impossible : la date de début de réservation est obligatoire.";
      case 'reservation_date_fin_not_null':
        return "Impossible : la date de fin de réservation est obligatoire.";
      case 'reservation_statut_not_null':
        return "Impossible : le statut de la réservation est obligatoire.";

      case 'location_id_client_not_null':
        return "Impossible : le client de la location est obligatoire.";
      case 'location_source_location_not_null':
        return "Impossible : l'origine de la location est obligatoire.";
      case 'location_date_debut_not_null':
        return "Impossible : la date de début de location est obligatoire.";
      case 'location_date_fin_not_null':
        return "Impossible : la date de fin de location est obligatoire.";
      case 'location_statut_not_null':
        return "Impossible : le statut de la location est obligatoire.";

      case 'chaine_email_id_chaine_not_null':
        return "Impossible : la chaîne associée à cet email est obligatoire.";
      case 'chaine_email_email_not_null':
        return "Impossible : l'email de la chaîne est obligatoire.";

      case 'chaine_telephone_id_chaine_not_null':
        return "Impossible : la chaîne associée à ce téléphone est obligatoire.";
      case 'chaine_telephone_telephone_not_null':
        return "Impossible : le téléphone de la chaîne est obligatoire.";

      case 'hotel_email_id_hotel_not_null':
        return "Impossible : l'hôtel associé à cet email est obligatoire.";
      case 'hotel_email_email_not_null':
        return "Impossible : l'email de l'hôtel est obligatoire.";

      case 'hotel_telephone_id_hotel_not_null':
        return "Impossible : l'hôtel associé à ce téléphone est obligatoire.";
      case 'hotel_telephone_telephone_not_null':
        return "Impossible : le téléphone de l'hôtel est obligatoire.";

      case 'commodite_nom_not_null':
        return "Impossible : le nom de la commodité est obligatoire.";

      case 'chambre_commodite_id_hotel_not_null':
      case 'chambre_commodite_num_chambre_not_null':
        return "Impossible : la chambre associée à cette commodité est obligatoire.";
      case 'chambre_commodite_id_commodite_not_null':
        return "Impossible : la commodité associée est obligatoire.";

      case 'gestion_hotel_id_hotel_not_null':
        return "Impossible : l'hôtel à gérer est obligatoire.";
      case 'gestion_hotel_id_employe_not_null':
        return "Impossible : l'employé gestionnaire est obligatoire.";
      case 'gestion_hotel_date_debut_not_null':
        return "Impossible : la date de début de gestion est obligatoire.";

      default:
        return "Impossible : un champ obligatoire est manquant.";
    }
  }

  // FOREIGN KEY
  if (code === '23503') {
    switch (constraint) {
      case 'hotel_id_chaine_fkey':
        return "La chaîne sélectionnée est introuvable.";
      case 'chambre_id_hotel_fkey':
        return "L'hôtel sélectionné pour cette chambre est introuvable.";
      case 'employe_id_hotel_fkey':
        return "L'hôtel sélectionné pour cet employé est introuvable.";

      case 'reservation_id_client_fkey':
      case 'location_id_client_fkey':
        return "Le client sélectionné est introuvable.";

      case 'reservation_id_hotel_num_chambre_fkey':
      case 'location_id_hotel_num_chambre_fkey':
      case 'chambre_commodite_id_hotel_num_chambre_fkey':
        return "La chambre sélectionnée est introuvable ou n'existe plus.";

      case 'location_id_employe_fkey':
        return "L'employé sélectionné est introuvable.";

      case 'location_id_reservation_fkey':
        return "La réservation associée est introuvable.";

      case 'chaine_email_id_chaine_fkey':
      case 'chaine_telephone_id_chaine_fkey':
        return "La chaîne associée est introuvable.";

      case 'hotel_email_id_hotel_fkey':
      case 'hotel_telephone_id_hotel_fkey':
        return "L'hôtel associé est introuvable.";

      case 'chambre_commodite_id_commodite_fkey':
        return "La commodité sélectionnée est introuvable.";

      case 'gestion_hotel_id_hotel_fkey':
        return "L'hôtel associé au gestionnaire est introuvable.";
      case 'gestion_hotel_id_hotel_id_employe_fkey':
        return "Impossible : cet employé ne travaille pas dans cet hôtel.";

      default:
        return "Action impossible : une référence liée n'existe pas dans la base de données.";
    }
  }

  // UNIQUE
  if (code === '23505') {
    switch (constraint) {
      case 'chaine_nom_chaine_key':
        return "Impossible : une chaîne avec ce nom existe déjà.";
      case 'hotel_id_chaine_nom_hotel_key':
        return "Impossible : un hôtel avec ce nom existe déjà dans cette chaîne.";
      case 'client_nas_key':
        return "Impossible : ce NAS client existe déjà.";
      case 'employe_nas_key':
        return "Impossible : ce NAS employé existe déjà.";
      case 'commodite_nom_key':
        return "Impossible : cette commodité existe déjà.";
      case 'location_id_reservation_key':
        return "Impossible : cette réservation a déjà été convertie en location.";
      case 'gestion_hotel_id_employe_key':
        return "Impossible : cet employé est déjà gestionnaire d'un autre hôtel.";
      default:
        return "Cette valeur existe déjà et doit rester unique.";
    }
  }

  // Triggers / exceptions personnalisées
  if (message.toLowerCase().includes('chevauche')) {
    return message;
  }

  if (message.toLowerCase().includes('gestionnaire')) {
    return message;
  }

  if (message.toLowerCase().includes('travaille dans l\'hôtel')) {
    return message;
  }

  if (message.toLowerCase().includes('introuvable')) {
    return message;
  }

  return message || "Une erreur inconnue est survenue.";
}

module.exports = { getDbErrorMessage };