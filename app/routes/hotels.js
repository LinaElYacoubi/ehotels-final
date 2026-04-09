const router = require('express').Router();
const db = require('../db');
const { getDbErrorMessage } = require('../utils/dbErrorMessage');

router.get('/', async (req, res, next) => {
  try {
    const {
      id_hotel,
      nom_hotel,
      id_chaine,
      zone,
      categorie,
      nb_chambre_min,
      nb_chambre_max,
      id_gestionnaire
    } = req.query;

    const params = [];
    const where = [];

    if (id_hotel) {
      where.push(`h.id_hotel = $${params.length + 1}`);
      params.push(parseInt(id_hotel));
    }

    if (nom_hotel) {
      where.push(`LOWER(h.nom_hotel) LIKE LOWER($${params.length + 1})`);
      params.push(`%${nom_hotel}%`);
    }

    if (id_chaine) {
      where.push(`h.id_chaine = $${params.length + 1}`);
      params.push(parseInt(id_chaine));
    }

    if (zone) {
      where.push(`LOWER(h.zone) LIKE LOWER($${params.length + 1})`);
      params.push(`%${zone}%`);
    }

    if (categorie) {
      where.push(`h.categorie = $${params.length + 1}`);
      params.push(parseInt(categorie));
    }

    if (nb_chambre_min) {
      where.push(`h.nb_chambre >= $${params.length + 1}`);
      params.push(parseInt(nb_chambre_min));
    }

    if (nb_chambre_max) {
      where.push(`h.nb_chambre <= $${params.length + 1}`);
      params.push(parseInt(nb_chambre_max));
    }

    if (id_gestionnaire) {
      where.push(`EXISTS (
        SELECT 1
        FROM GESTION_HOTEL gh
        WHERE gh.id_hotel = h.id_hotel
          AND gh.id_employe = $${params.length + 1}
      )`);
      params.push(parseInt(id_gestionnaire));
    }

    const result = await db.query(
      `
      SELECT h.*, ch.nom_chaine,
        (SELECT email FROM HOTEL_EMAIL WHERE id_hotel = h.id_hotel LIMIT 1) AS email,
        (SELECT telephone FROM HOTEL_TELEPHONE WHERE id_hotel = h.id_hotel LIMIT 1) AS telephone,
        (SELECT gh.id_employe
         FROM GESTION_HOTEL gh
         WHERE gh.id_hotel = h.id_hotel) AS id_gestionnaire,
        (SELECT e.nom || ' ' || e.prenom
         FROM GESTION_HOTEL gh
         JOIN EMPLOYE e ON e.id_employe = gh.id_employe
         WHERE gh.id_hotel = h.id_hotel) AS gestionnaire_nom
      FROM HOTEL h
      JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY h.id_hotel
      `,
      params
    );

    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT h.*, ch.nom_chaine,
        (SELECT email FROM HOTEL_EMAIL WHERE id_hotel = h.id_hotel LIMIT 1) AS email,
        (SELECT telephone FROM HOTEL_TELEPHONE WHERE id_hotel = h.id_hotel LIMIT 1) AS telephone,
        (SELECT gh.id_employe FROM GESTION_HOTEL gh WHERE gh.id_hotel = h.id_hotel) AS id_gestionnaire,
        (SELECT e.nom || ' ' || e.prenom
          FROM GESTION_HOTEL gh
          JOIN EMPLOYE e ON e.id_employe = gh.id_employe
          WHERE gh.id_hotel = h.id_hotel) AS gestionnaire_nom
          FROM HOTEL h
      JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      WHERE h.id_hotel=$1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Hôtel introuvable' });
    res.json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.post('/', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { id_chaine, nom_hotel, categorie, adresse, zone, email, telephone } = req.body;
    const r = await client.query(
      'INSERT INTO HOTEL (id_chaine,nom_hotel,categorie,adresse,zone) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [id_chaine, nom_hotel, categorie, adresse, zone]
    );
    const id = r.rows[0].id_hotel;
    if (email)     await client.query('INSERT INTO HOTEL_EMAIL(id_hotel,email) VALUES($1,$2)', [id, email]);
    if (telephone) await client.query('INSERT INTO HOTEL_TELEPHONE(id_hotel,telephone) VALUES($1,$2)', [id, telephone]);
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); return res.status(400).json({ error: getDbErrorMessage(err) }); }
  finally { client.release(); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { id_chaine, nom_hotel, categorie, adresse, zone, email, telephone, id_gestionnaire } = req.body;
    const r = await client.query(
      'UPDATE HOTEL SET id_chaine=$1,nom_hotel=$2,categorie=$3,adresse=$4,zone=$5 WHERE id_hotel=$6 RETURNING *',
      [id_chaine, nom_hotel, categorie, adresse, zone, req.params.id]
    );
    if (!r.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Hôtel introuvable' }); }
    await client.query('DELETE FROM HOTEL_EMAIL WHERE id_hotel=$1', [req.params.id]);
    await client.query('DELETE FROM HOTEL_TELEPHONE WHERE id_hotel=$1', [req.params.id]);
    if (email)     await client.query('INSERT INTO HOTEL_EMAIL(id_hotel,email) VALUES($1,$2)', [req.params.id, email]);
    if (telephone) await client.query('INSERT INTO HOTEL_TELEPHONE(id_hotel,telephone) VALUES($1,$2)', [req.params.id, telephone]);
    if (id_gestionnaire) {
      await client.query(
        `INSERT INTO GESTION_HOTEL (id_hotel, id_employe, date_debut)
        VALUES ($1, $2, CURRENT_DATE)
        ON CONFLICT (id_hotel)
        DO UPDATE SET id_employe = EXCLUDED.id_employe`,
        [req.params.id, id_gestionnaire]
      );
    }
    await client.query('COMMIT');
    res.json(r.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); return res.status(400).json({ error: getDbErrorMessage(err) }); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM HOTEL WHERE id_hotel=$1', [req.params.id]);
    res.json({ message: 'Hôtel supprimé' });
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

module.exports = router;
