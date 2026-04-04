const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { id_chaine } = req.query;
    const params = [];
    let where = '';
    if (id_chaine) { where = 'WHERE h.id_chaine=$1'; params.push(id_chaine); }
    const result = await db.query(`
      SELECT h.*, ch.nom_chaine,
        (SELECT email FROM HOTEL_EMAIL WHERE id_hotel = h.id_hotel LIMIT 1) AS email,
        (SELECT telephone FROM HOTEL_TELEPHONE WHERE id_hotel = h.id_hotel LIMIT 1) AS telephone
      FROM HOTEL h
      JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      ${where} ORDER BY h.nom_hotel
    `, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT h.*, ch.nom_chaine,
        (SELECT email FROM HOTEL_EMAIL WHERE id_hotel = h.id_hotel LIMIT 1) AS email,
        (SELECT telephone FROM HOTEL_TELEPHONE WHERE id_hotel = h.id_hotel LIMIT 1) AS telephone
      FROM HOTEL h
      JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      WHERE h.id_hotel=$1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Hôtel introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
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
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { id_chaine, nom_hotel, categorie, adresse, zone, email, telephone } = req.body;
    const r = await client.query(
      'UPDATE HOTEL SET id_chaine=$1,nom_hotel=$2,categorie=$3,adresse=$4,zone=$5 WHERE id_hotel=$6 RETURNING *',
      [id_chaine, nom_hotel, categorie, adresse, zone, req.params.id]
    );
    if (!r.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Hôtel introuvable' }); }
    await client.query('DELETE FROM HOTEL_EMAIL WHERE id_hotel=$1', [req.params.id]);
    await client.query('DELETE FROM HOTEL_TELEPHONE WHERE id_hotel=$1', [req.params.id]);
    if (email)     await client.query('INSERT INTO HOTEL_EMAIL(id_hotel,email) VALUES($1,$2)', [req.params.id, email]);
    if (telephone) await client.query('INSERT INTO HOTEL_TELEPHONE(id_hotel,telephone) VALUES($1,$2)', [req.params.id, telephone]);
    await client.query('COMMIT');
    res.json(r.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM HOTEL WHERE id_hotel=$1', [req.params.id]);
    res.json({ message: 'Hôtel supprimé' });
  } catch (err) { next(err); }
});

module.exports = router;
