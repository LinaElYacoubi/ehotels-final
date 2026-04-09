const router = require('express').Router();
const db = require('../db');
const { getDbErrorMessage } = require('../utils/dbErrorMessage');

router.get('/', async (req, res, next) => {
  try {
    const {
      id_client,
      nom,
      prenom,
      nom_complet,
      nas,
      date_inscription_min,
      date_inscription_max
    } = req.query;

    const params = [];
    const where = [];

    if (id_client) {
      where.push(`id_client = $${params.length + 1}`);
      params.push(parseInt(id_client));
    }

    if (nom) {
      where.push(`LOWER(nom) LIKE LOWER($${params.length + 1})`);
      params.push(`%${nom}%`);
    }

    if (prenom) {
      where.push(`LOWER(prenom) LIKE LOWER($${params.length + 1})`);
      params.push(`%${prenom}%`);
    }

    if (nom_complet) {
      where.push(`LOWER(nom || ' ' || prenom) LIKE LOWER($${params.length + 1})`);
      params.push(`%${nom_complet}%`);
    }

    if (nas) {
      where.push(`LOWER(nas) LIKE LOWER($${params.length + 1})`);
      params.push(`%${nas}%`);
    }

    if (date_inscription_min) {
      where.push(`date_inscription >= $${params.length + 1}`);
      params.push(date_inscription_min);
    }

    if (date_inscription_max) {
      where.push(`date_inscription <= $${params.length + 1}`);
      params.push(date_inscription_max);
    }

    const result = await db.query(
      `
      SELECT *
      FROM CLIENT
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY id_client
      `,
      params
    );

    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM CLIENT WHERE id_client=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Client introuvable' });
    res.json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.post('/', async (req, res, next) => {
  try {
    const { nom, prenom, adresse, nas, date_inscription } = req.body;
    const result = await db.query(
      'INSERT INTO CLIENT (nom,prenom,adresse,nas,date_inscription) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nom, prenom, adresse, nas, date_inscription]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nom, prenom, adresse, nas, date_inscription } = req.body;
    const result = await db.query(
      'UPDATE CLIENT SET nom=$1,prenom=$2,adresse=$3,nas=$4,date_inscription=$5 WHERE id_client=$6 RETURNING *',
      [nom, prenom, adresse, nas, date_inscription, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Client introuvable' });
    res.json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM CLIENT WHERE id_client=$1', [req.params.id]);
    res.json({ message: 'Client supprimé' });
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

module.exports = router;
