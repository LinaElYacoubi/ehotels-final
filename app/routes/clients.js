const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM CLIENT';
    const params = [];
    if (search) {
      sql += ' WHERE nom ILIKE $1 OR prenom ILIKE $1';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY nom, prenom';
    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM CLIENT WHERE id_client=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Client introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { nom, prenom, adresse, nas, date_inscription } = req.body;
    const result = await db.query(
      'INSERT INTO CLIENT (nom,prenom,adresse,nas,date_inscription) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [nom, prenom, adresse, nas, date_inscription]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM CLIENT WHERE id_client=$1', [req.params.id]);
    res.json({ message: 'Client supprimé' });
  } catch (err) { next(err); }
});

module.exports = router;
