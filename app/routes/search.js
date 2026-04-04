const router = require('express').Router();
const db = require('../db');

// GET /api/search/chambres
router.get('/chambres', async (req, res, next) => {
  try {
    const { date_debut, date_fin, capacite, superficie_min, id_chaine, categorie, prix_max, zone } = req.query;
    const params = [];
    let i = 1;
    let where = [];

    if (date_debut && date_fin) {
      where.push(`NOT EXISTS (
        SELECT 1 FROM RESERVATION r
        WHERE r.id_hotel = c.id_hotel AND r.num_chambre = c.num_chambre
          AND r.statut NOT IN ('annulee','convertie')
          AND r.date_debut <= $${i+1} AND r.date_fin >= $${i}
      ) AND NOT EXISTS (
        SELECT 1 FROM LOCATION l
        WHERE l.id_hotel = c.id_hotel AND l.num_chambre = c.num_chambre
          AND l.statut NOT IN ('terminee','annulee')
          AND l.date_debut <= $${i+1} AND l.date_fin >= $${i}
      )`);
      params.push(date_debut, date_fin);
      i += 2;
    }

    const { nb_chambres_min } = req.query;
    if (capacite)        { where.push(`c.capacite = $${i++}`);          params.push(capacite); }
    if (superficie_min)  { where.push(`c.superficie >= $${i++}`);       params.push(parseInt(superficie_min)); }
    if (id_chaine)       { where.push(`h.id_chaine = $${i++}`);         params.push(parseInt(id_chaine)); }
    if (categorie)       { where.push(`h.categorie = $${i++}`);         params.push(parseInt(categorie)); }
    if (prix_max)        { where.push(`c.prix <= $${i++}`);             params.push(parseFloat(prix_max)); }
    if (zone)            { where.push(`h.zone = $${i++}`);              params.push(zone); }
    if (nb_chambres_min) { where.push(`h.nb_chambre >= $${i++}`);       params.push(parseInt(nb_chambres_min)); }

    const sql = `
      SELECT c.id_hotel, c.num_chambre, c.prix, c.capacite, c.superficie, c.vue, c.poss_ajout_lit, c.etat,
             h.nom_hotel, h.categorie, h.zone, ch.nom_chaine
      FROM CHAMBRE c
      JOIN HOTEL h ON c.id_hotel = h.id_hotel
      JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY c.prix ASC
    `;
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// GET /api/search/zones
router.get('/zones', async (req, res, next) => {
  try {
    const result = await db.query('SELECT DISTINCT zone FROM HOTEL ORDER BY zone');
    res.json(result.rows.map(r => r.zone));
  } catch (err) { next(err); }
});

module.exports = router;
