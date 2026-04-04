const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const { id_hotel } = req.query;
    const params = [];
    let where = '';
    if (id_hotel) { where = 'WHERE e.id_hotel=$1'; params.push(id_hotel); }
    const result = await db.query(
      `SELECT e.*, h.nom_hotel FROM EMPLOYE e
       JOIN HOTEL h ON e.id_hotel = h.id_hotel
       ${where} ORDER BY e.nom, e.prenom`,
      params
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM EMPLOYE WHERE id_employe=$1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Employé introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_hotel, nom, prenom, adresse, nas, role } = req.body;
    const result = await db.query(
      'INSERT INTO EMPLOYE (id_hotel,nom,prenom,adresse,nas,role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [id_hotel, nom, prenom, adresse, nas, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id_hotel, nom, prenom, adresse, nas, role } = req.body;
    const result = await db.query(
      'UPDATE EMPLOYE SET id_hotel=$1,nom=$2,prenom=$3,adresse=$4,nas=$5,role=$6 WHERE id_employe=$7 RETURNING *',
      [id_hotel, nom, prenom, adresse, nas, role, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Employé introuvable' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM EMPLOYE WHERE id_employe=$1', [req.params.id]);
    res.json({ message: 'Employé supprimé' });
  } catch (err) { next(err); }
});

module.exports = router;
