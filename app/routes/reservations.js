const router = require('express').Router();
const db = require('../db');
const { getDbErrorMessage } = require('../utils/dbErrorMessage');

router.get('/', async (req, res, next) => {
  try {
    const {
      id_reservation,
      id_client,
      client,
      id_hotel,
      num_chambre,
      statut,
      date_reservation_min,
      date_reservation_max,
      date_debut_min,
      date_debut_max,
      date_fin_min,
      date_fin_max
    } = req.query;

    const params = [];
    const where = [];

    if (id_reservation) {
      where.push(`r.id_reservation = $${params.length + 1}`);
      params.push(parseInt(id_reservation));
    }

    if (id_client) {
      where.push(`r.id_client = $${params.length + 1}`);
      params.push(parseInt(id_client));
    }

    if (client) {
      where.push(`LOWER(c.nom || ' ' || c.prenom) LIKE LOWER($${params.length + 1})`);
      params.push(`%${client}%`);
    }

    if (id_hotel) {
      where.push(`r.id_hotel = $${params.length + 1}`);
      params.push(parseInt(id_hotel));
    }

    if (num_chambre) {
      where.push(`r.num_chambre = $${params.length + 1}`);
      params.push(parseInt(num_chambre));
    }

    if (statut) {
      where.push(`r.statut = $${params.length + 1}`);
      params.push(statut);
    }

    if (date_reservation_min) {
      where.push(`r.date_reservation >= $${params.length + 1}`);
      params.push(date_reservation_min);
    }

    if (date_reservation_max) {
      where.push(`r.date_reservation <= $${params.length + 1}`);
      params.push(date_reservation_max);
    }

    if (date_debut_min) {
      where.push(`r.date_debut >= $${params.length + 1}`);
      params.push(date_debut_min);
    }

    if (date_debut_max) {
      where.push(`r.date_debut <= $${params.length + 1}`);
      params.push(date_debut_max);
    }

    if (date_fin_min) {
      where.push(`r.date_fin >= $${params.length + 1}`);
      params.push(date_fin_min);
    }

    if (date_fin_max) {
      where.push(`r.date_fin <= $${params.length + 1}`);
      params.push(date_fin_max);
    }

    const result = await db.query(
      `
      SELECT r.*, c.nom || ' ' || c.prenom AS client_nom,
             h.nom_hotel, ch.nom_chaine
      FROM RESERVATION r
      JOIN CLIENT c ON r.id_client = c.id_client
      LEFT JOIN HOTEL h ON r.id_hotel = h.id_hotel
      LEFT JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY r.id_reservation DESC
      `,
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
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
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
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { statut, date_debut, date_fin } = req.body;
    if (date_debut === undefined && date_fin === undefined) {
      const result = await db.query(
        'UPDATE RESERVATION SET statut=$1 WHERE id_reservation=$2 RETURNING *',
        [statut, req.params.id]
      );
      if (!result.rows.length) return res.status(404).json({ error: 'Réservation introuvable' });
      return res.json(result.rows[0]);
    };
    const result = await db.query(
      'UPDATE RESERVATION SET statut=$1, date_debut=$2, date_fin=$3 WHERE id_reservation=$4 RETURNING *',
      [statut, date_debut, date_fin, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Réservation introuvable' });
    res.json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM RESERVATION WHERE id_reservation=$1', [req.params.id]);
    res.json({ message: 'Réservation supprimée' });
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

// POST /api/reservations/:id/convert — convert reservation to location
router.post('/:id/convert', async (req, res, next) => {
  const client = await db.connect();

  try {
    const { id_employe } = req.body;
    if (!id_employe) {
      return res.status(400).json({ error: 'id_employe requis pour le check-in' });
    }
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
      VALUES ($1,$2,$3,'apres_reservation',$4,$5,CURRENT_DATE,$6,$7,'en_cours')
      RETURNING *`,
      [r.id_client, r.id_hotel, r.num_chambre, r.date_debut, r.date_fin, r.id_reservation, id_employe]
    );
    await client.query(
      "UPDATE RESERVATION SET statut='convertie' WHERE id_reservation=$1",
      [req.params.id]
    );
    await client.query('COMMIT');
    res.json({ location: loc.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: getDbErrorMessage(err) });
  } finally {
    client.release();
  }
});

module.exports = router;
