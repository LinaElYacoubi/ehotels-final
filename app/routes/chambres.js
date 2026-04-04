const router = require('express').Router();
const db = require('../db');

// Default commodités to seed if none exist
const DEFAULT_COMMODITES = ['TV', 'WiFi', 'Climatisation', 'Mini-bar', 'Coffre-fort', 'Jacuzzi', 'Balcon', 'Réfrigérateur'];

async function ensureCommodites() {
  const { rows } = await db.query('SELECT COUNT(*) FROM COMMODITE');
  if (parseInt(rows[0].count) === 0) {
    for (const nom of DEFAULT_COMMODITES) {
      await db.query('INSERT INTO COMMODITE(nom) VALUES($1) ON CONFLICT(nom) DO NOTHING', [nom]);
    }
  }
}

// GET all commodités
router.get('/commodites', async (req, res, next) => {
  try {
    await ensureCommodites();
    const result = await db.query('SELECT * FROM COMMODITE ORDER BY nom');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const { id_hotel } = req.query;
    const params = [];
    let where = '';
    if (id_hotel) { where = 'WHERE c.id_hotel=$1'; params.push(id_hotel); }
    const result = await db.query(`
      SELECT c.*, h.nom_hotel,
        COALESCE(
          ARRAY_AGG(co.nom ORDER BY co.nom) FILTER (WHERE co.nom IS NOT NULL),
          ARRAY[]::text[]
        ) AS commodites
      FROM CHAMBRE c
      JOIN HOTEL h ON c.id_hotel = h.id_hotel
      LEFT JOIN CHAMBRE_COMMODITE cc ON cc.id_hotel = c.id_hotel AND cc.num_chambre = c.num_chambre
      LEFT JOIN COMMODITE co ON co.id_commodite = cc.id_commodite
      ${where}
      GROUP BY c.id_hotel, c.num_chambre, h.nom_hotel
      ORDER BY c.id_hotel, c.num_chambre
    `, params);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id_hotel/:num_chambre', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT c.*,
        COALESCE(
          ARRAY_AGG(co.nom ORDER BY co.nom) FILTER (WHERE co.nom IS NOT NULL),
          ARRAY[]::text[]
        ) AS commodites
      FROM CHAMBRE c
      LEFT JOIN CHAMBRE_COMMODITE cc ON cc.id_hotel = c.id_hotel AND cc.num_chambre = c.num_chambre
      LEFT JOIN COMMODITE co ON co.id_commodite = cc.id_commodite
      WHERE c.id_hotel=$1 AND c.num_chambre=$2
      GROUP BY c.id_hotel, c.num_chambre
    `, [req.params.id_hotel, req.params.num_chambre]);
    if (!result.rows.length) return res.status(404).json({ error: 'Chambre introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { id_hotel, num_chambre, prix, capacite, superficie, vue, poss_ajout_lit, etat, commodites } = req.body;
    const r = await client.query(
      `INSERT INTO CHAMBRE (id_hotel,num_chambre,prix,capacite,superficie,vue,poss_ajout_lit,etat)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id_hotel, num_chambre, prix, capacite, superficie, vue, poss_ajout_lit, etat]
    );
    if (commodites && commodites.length) {
      for (const nom of commodites) {
        await client.query('INSERT INTO COMMODITE(nom) VALUES($1) ON CONFLICT(nom) DO NOTHING', [nom]);
        await client.query(`
          INSERT INTO CHAMBRE_COMMODITE(id_hotel,num_chambre,id_commodite)
          SELECT $1,$2,id_commodite FROM COMMODITE WHERE nom=$3
          ON CONFLICT DO NOTHING
        `, [id_hotel, num_chambre, nom]);
      }
    }
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.put('/:id_hotel/:num_chambre', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { prix, capacite, superficie, vue, poss_ajout_lit, etat, commodites } = req.body;
    const r = await client.query(
      `UPDATE CHAMBRE SET prix=$1,capacite=$2,superficie=$3,vue=$4,poss_ajout_lit=$5,etat=$6
       WHERE id_hotel=$7 AND num_chambre=$8 RETURNING *`,
      [prix, capacite, superficie, vue, poss_ajout_lit, etat, req.params.id_hotel, req.params.num_chambre]
    );
    if (!r.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Chambre introuvable' }); }
    await client.query('DELETE FROM CHAMBRE_COMMODITE WHERE id_hotel=$1 AND num_chambre=$2',
      [req.params.id_hotel, req.params.num_chambre]);
    if (commodites && commodites.length) {
      for (const nom of commodites) {
        await client.query('INSERT INTO COMMODITE(nom) VALUES($1) ON CONFLICT(nom) DO NOTHING', [nom]);
        await client.query(`
          INSERT INTO CHAMBRE_COMMODITE(id_hotel,num_chambre,id_commodite)
          SELECT $1,$2,id_commodite FROM COMMODITE WHERE nom=$3
          ON CONFLICT DO NOTHING
        `, [req.params.id_hotel, req.params.num_chambre, nom]);
      }
    }
    await client.query('COMMIT');
    res.json(r.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id_hotel/:num_chambre', async (req, res, next) => {
  try {
    await db.query('DELETE FROM CHAMBRE WHERE id_hotel=$1 AND num_chambre=$2',
      [req.params.id_hotel, req.params.num_chambre]);
    res.json({ message: 'Chambre supprimée' });
  } catch (err) { next(err); }
});

module.exports = router;
