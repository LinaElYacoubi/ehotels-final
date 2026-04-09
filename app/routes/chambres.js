const router = require('express').Router();
const db = require('../db');
const { getDbErrorMessage } = require('../utils/dbErrorMessage');

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
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.get('/', async (req, res, next) => {
  try {
    const {
      id_hotel,
      num_chambre,
      capacite,
      vue,
      etat,
      poss_ajout_lit,
      prix_min,
      prix_max,
      superficie_min,
      superficie_max
    } = req.query;

    const params = [];
    const where = [];

    if (id_hotel) {
      where.push(`c.id_hotel = $${params.length + 1}`);
      params.push(parseInt(id_hotel));
    }

    if (num_chambre) {
      where.push(`c.num_chambre = $${params.length + 1}`);
      params.push(parseInt(num_chambre));
    }

    if (capacite) {
      where.push(`c.capacite = $${params.length + 1}`);
      params.push(capacite);
    }

    if (vue) {
      where.push(`c.vue = $${params.length + 1}`);
      params.push(vue);
    }

    if (etat) {
      where.push(`c.etat = $${params.length + 1}`);
      params.push(etat);
    }

    if (poss_ajout_lit !== undefined && poss_ajout_lit !== '') {
      where.push(`c.poss_ajout_lit = $${params.length + 1}`);
      params.push(poss_ajout_lit === 'true');
    }

    if (prix_min) {
      where.push(`c.prix >= $${params.length + 1}`);
      params.push(parseFloat(prix_min));
    }

    if (prix_max) {
      where.push(`c.prix <= $${params.length + 1}`);
      params.push(parseFloat(prix_max));
    }

    if (superficie_min) {
      where.push(`c.superficie >= $${params.length + 1}`);
      params.push(parseInt(superficie_min));
    }

    if (superficie_max) {
      where.push(`c.superficie <= $${params.length + 1}`);
      params.push(parseInt(superficie_max));
    }

    const result = await db.query(
      `
      SELECT c.*, h.nom_hotel, h.zone, ch.nom_chaine
      FROM CHAMBRE c
      JOIN HOTEL h ON c.id_hotel = h.id_hotel
      JOIN CHAINE ch ON h.id_chaine = ch.id_chaine
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY c.id_hotel, c.num_chambre
      `,
      params
    );

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
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
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
  } catch (err) { await client.query('ROLLBACK'); return res.status(400).json({ error: getDbErrorMessage(err) }); }
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
  } catch (err) { await client.query('ROLLBACK'); return res.status(400).json({ error: getDbErrorMessage(err) }); }
  finally { client.release(); }
});

router.delete('/:id_hotel/:num_chambre', async (req, res, next) => {
  try {
    await db.query('DELETE FROM CHAMBRE WHERE id_hotel=$1 AND num_chambre=$2',
      [req.params.id_hotel, req.params.num_chambre]);
    res.json({ message: 'Chambre supprimée' });
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

module.exports = router;
