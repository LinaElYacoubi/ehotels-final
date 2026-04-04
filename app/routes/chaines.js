const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT c.id_chaine, c.nom_chaine, c.adr_siege, c.nb_hotel,
        (SELECT email FROM CHAINE_EMAIL WHERE id_chaine = c.id_chaine LIMIT 1) AS email,
        (SELECT telephone FROM CHAINE_TELEPHONE WHERE id_chaine = c.id_chaine LIMIT 1) AS telephone
      FROM CHAINE c ORDER BY c.nom_chaine
    `);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT c.id_chaine, c.nom_chaine, c.adr_siege, c.nb_hotel,
        (SELECT email FROM CHAINE_EMAIL WHERE id_chaine = c.id_chaine LIMIT 1) AS email,
        (SELECT telephone FROM CHAINE_TELEPHONE WHERE id_chaine = c.id_chaine LIMIT 1) AS telephone
      FROM CHAINE c WHERE c.id_chaine = $1
    `, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Chaîne introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { nom_chaine, adr_siege, email, telephone } = req.body;
    const r = await client.query(
      'INSERT INTO CHAINE (nom_chaine, adr_siege) VALUES ($1,$2) RETURNING *',
      [nom_chaine, adr_siege]
    );
    const id = r.rows[0].id_chaine;
    if (email)     await client.query('INSERT INTO CHAINE_EMAIL(id_chaine,email) VALUES($1,$2)', [id, email]);
    if (telephone) await client.query('INSERT INTO CHAINE_TELEPHONE(id_chaine,telephone) VALUES($1,$2)', [id, telephone]);
    await client.query('COMMIT');
    res.status(201).json(r.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.put('/:id', async (req, res, next) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { nom_chaine, adr_siege, email, telephone } = req.body;
    const r = await client.query(
      'UPDATE CHAINE SET nom_chaine=$1, adr_siege=$2 WHERE id_chaine=$3 RETURNING *',
      [nom_chaine, adr_siege, req.params.id]
    );
    if (!r.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Chaîne introuvable' }); }
    await client.query('DELETE FROM CHAINE_EMAIL WHERE id_chaine=$1', [req.params.id]);
    await client.query('DELETE FROM CHAINE_TELEPHONE WHERE id_chaine=$1', [req.params.id]);
    if (email)     await client.query('INSERT INTO CHAINE_EMAIL(id_chaine,email) VALUES($1,$2)', [req.params.id, email]);
    if (telephone) await client.query('INSERT INTO CHAINE_TELEPHONE(id_chaine,telephone) VALUES($1,$2)', [req.params.id, telephone]);
    await client.query('COMMIT');
    res.json(r.rows[0]);
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM CHAINE WHERE id_chaine=$1', [req.params.id]);
    res.json({ message: 'Chaîne supprimée' });
  } catch (err) { next(err); }
});

module.exports = router;
