const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { id_client, statut } = req.query;
    const params = [];
    const where = [];
    if (id_client) { where.push(`l.id_client=$${params.length+1}`); params.push(id_client); }
    if (statut)    { where.push(`l.statut=$${params.length+1}`);    params.push(statut); }
    const result = await db.query(
      `SELECT l.*, c.nom||' '||c.prenom AS client_nom,
              h.nom_hotel, ch.nom_chaine
       FROM LOCATION l
       JOIN CLIENT c ON l.id_client = c.id_client
       LEFT JOIN HOTEL h ON l.id_hotel = h.id_hotel
       LEFT JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
       ${where.length ? 'WHERE '+where.join(' AND ') : ''}
       ORDER BY l.date_debut DESC`,
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
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_client, id_hotel, num_chambre, date_debut, date_fin } = req.body;
    const result = await db.query(
      `INSERT INTO LOCATION (id_client,id_hotel,num_chambre,date_debut,date_fin,statut)
       VALUES ($1,$2,$3,$4,$5,'en_cours') RETURNING *`,
      [id_client, id_hotel, num_chambre, date_debut, date_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { statut } = req.body;
    const result = await db.query(
      'UPDATE LOCATION SET statut=$1 WHERE id_location=$2 RETURNING *',
      [statut, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Location introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM LOCATION WHERE id_location=$1', [req.params.id]);
    res.json({ message: 'Location supprimée' });
  } catch (err) { next(err); }
});

module.exports = router;
