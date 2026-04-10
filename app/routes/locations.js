const router = require('express').Router();
const db = require('../db');
const { getDbErrorMessage } = require('../utils/dbErrorMessage');

router.get('/', async (req, res, next) => {
  try {
    const {
      id_location,
      id_client,
      client,
      id_hotel,
      num_chambre,
      statut,
      source_location,
      id_employe,
      date_debut_min,
      date_debut_max,
      date_fin_min,
      date_fin_max,
      date_checkin_min,
      date_checkin_max,
      date_checkout_min,
      date_checkout_max
    } = req.query;

    const params = [];
    const where = [];

    if (id_location) {
      where.push(`l.id_location = $${params.length + 1}`);
      params.push(parseInt(id_location));
    }

    if (id_client) {
      where.push(`l.id_client = $${params.length + 1}`);
      params.push(parseInt(id_client));
    }

    if (client) {
      where.push(`LOWER(c.nom || ' ' || c.prenom) LIKE LOWER($${params.length + 1})`);
      params.push(`%${client}%`);
    }

    if (id_hotel) {
      where.push(`l.id_hotel = $${params.length + 1}`);
      params.push(parseInt(id_hotel));
    }

    if (num_chambre) {
      where.push(`l.num_chambre = $${params.length + 1}`);
      params.push(parseInt(num_chambre));
    }

    if (statut) {
      where.push(`l.statut = $${params.length + 1}`);
      params.push(statut);
    }

    if (source_location) {
      where.push(`l.source_location = $${params.length + 1}`);
      params.push(source_location);
    }

    if (id_employe) {
      where.push(`l.id_employe = $${params.length + 1}`);
      params.push(parseInt(id_employe));
    }

    if (date_debut_min) {
      where.push(`l.date_debut >= $${params.length + 1}`);
      params.push(date_debut_min);
    }

    if (date_debut_max) {
      where.push(`l.date_debut <= $${params.length + 1}`);
      params.push(date_debut_max);
    }

    if (date_fin_min) {
      where.push(`l.date_fin >= $${params.length + 1}`);
      params.push(date_fin_min);
    }

    if (date_fin_max) {
      where.push(`l.date_fin <= $${params.length + 1}`);
      params.push(date_fin_max);
    }

    if (date_checkin_min) {
      where.push(`l.date_checkin >= $${params.length + 1}`);
      params.push(date_checkin_min);
    }

    if (date_checkin_max) {
      where.push(`l.date_checkin <= $${params.length + 1}`);
      params.push(date_checkin_max);
    }

    if (date_checkout_min) {
      where.push(`l.date_checkout >= $${params.length + 1}`);
      params.push(date_checkout_min);
    }

    if (date_checkout_max) {
      where.push(`l.date_checkout <= $${params.length + 1}`);
      params.push(date_checkout_max);
    }

    const result = await db.query(
      `
      SELECT l.*, c.nom || ' ' || c.prenom AS client_nom,
             h.nom_hotel, ch.nom_chaine,
             e.nom || ' ' || e.prenom AS employe_nom
      FROM LOCATION l
      JOIN CLIENT c ON l.id_client = c.id_client
      LEFT JOIN HOTEL h ON l.id_hotel = h.id_hotel
      LEFT JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      LEFT JOIN EMPLOYE e ON l.id_employe = e.id_employe
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY l.id_location DESC
      `,
      params
    );

    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT l.*, c.nom||' '||c.prenom AS client_nom, h.nom_hotel
       FROM LOCATION l
       JOIN CLIENT c ON l.id_client=c.id_client
       LEFT JOIN HOTEL h ON l.id_hotel=h.id_hotel
       WHERE l.id_location=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Location introuvable' });
    res.json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_client, id_hotel, num_chambre, date_debut, date_fin, id_employe } = req.body;
    const result = await db.query(
      `INSERT INTO LOCATION (
        id_client,
        id_hotel,
        num_chambre,
        source_location,
        date_debut,
        date_fin,
        date_checkin,
        id_reservation,
        id_employe,
        statut
      )
      VALUES ($1,$2,$3,'directe',$4,$5,CURRENT_DATE,NULL,$6,'active')
      RETURNING *`,
      [id_client, id_hotel, num_chambre, date_debut, date_fin, id_employe]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { statut } = req.body;
    const result = await db.query(
      statut === 'terminee'
        ? 'UPDATE LOCATION SET statut=$1, date_checkout=CURRENT_DATE WHERE id_location=$2 RETURNING *'
        : 'UPDATE LOCATION SET statut=$1 WHERE id_location=$2 RETURNING *',
      [statut, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Location introuvable' });
    res.json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM LOCATION WHERE id_location=$1', [req.params.id]);
    res.json({ message: 'Location supprimée' });
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

module.exports = router;
