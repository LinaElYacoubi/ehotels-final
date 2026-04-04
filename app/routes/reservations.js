const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { id_client, statut } = req.query;
    const params = [];
    const where = [];
    if (id_client) { where.push(`r.id_client=$${params.length+1}`); params.push(id_client); }
    if (statut)    { where.push(`r.statut=$${params.length+1}`);    params.push(statut); }
    const result = await db.query(
      `SELECT r.*, c.nom||' '||c.prenom AS client_nom,
              h.nom_hotel, ch.nom_chaine
       FROM RESERVATION r
       JOIN CLIENT c ON r.id_client = c.id_client
       LEFT JOIN HOTEL h ON r.id_hotel = h.id_hotel
       LEFT JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
       ${where.length ? 'WHERE '+where.join(' AND ') : ''}
       ORDER BY r.date_debut DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.*, c.nom||' '||c.prenom AS client_nom, h.nom_hotel
       FROM RESERVATION r
       JOIN CLIENT c ON r.id_client=c.id_client
       LEFT JOIN HOTEL h ON r.id_hotel=h.id_hotel
       WHERE r.id_reservation=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Réservation introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_client, id_hotel, num_chambre, date_debut, date_fin } = req.body;
    const result = await db.query(
      `INSERT INTO RESERVATION (id_client,id_hotel,num_chambre,date_reservation,date_debut,date_fin,statut)
       VALUES ($1,$2,$3,CURRENT_DATE,$4,$5,'confirmee') RETURNING *`,
      [id_client, id_hotel, num_chambre, date_debut, date_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { statut, date_debut, date_fin } = req.body;
    const result = await db.query(
      'UPDATE RESERVATION SET statut=$1,date_debut=$2,date_fin=$3 WHERE id_reservation=$4 RETURNING *',
      [statut, date_debut, date_fin, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Réservation introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM RESERVATION WHERE id_reservation=$1', [req.params.id]);
    res.json({ message: 'Réservation supprimée' });
  } catch (err) { next(err); }
});

// POST /api/reservations/:id/convert — convert reservation to location
router.post('/:id/convert', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const resRow = await client.query(
      'SELECT * FROM RESERVATION WHERE id_reservation=$1 AND statut=$2',
      [req.params.id, 'confirmee']
    );
    if (!resRow.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Réservation introuvable ou déjà convertie/annulée' });
    }
    const r = resRow.rows[0];
    const loc = await client.query(
      `INSERT INTO LOCATION (id_client,id_hotel,num_chambre,date_debut,date_fin,statut)
       VALUES ($1,$2,$3,$4,$5,'en_cours') RETURNING *`,
      [r.id_client, r.id_hotel, r.num_chambre, r.date_debut, r.date_fin]
    );
    await client.query(
      "UPDATE RESERVATION SET statut='convertie' WHERE id_reservation=$1",
      [req.params.id]
    );
    await client.query('COMMIT');
    res.json({ location: loc.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
