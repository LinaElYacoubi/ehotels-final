const router = require('express').Router();
const db = require('../db');
const { getDbErrorMessage } = require('../utils/dbErrorMessage');

router.get('/', async (req, res, next) => {
  try {
    const { id_employe, nom, prenom, nom_complet, nas, id_hotel, role } = req.query;

    const params = [];
    const where = [];

    if (id_employe) {
      where.push(`e.id_employe = $${params.length + 1}`);
      params.push(parseInt(id_employe));
    }

    if (nom) {
      where.push(`LOWER(e.nom) LIKE LOWER($${params.length + 1})`);
      params.push(`%${nom}%`);
    }

    if (prenom) {
      where.push(`LOWER(e.prenom) LIKE LOWER($${params.length + 1})`);
      params.push(`%${prenom}%`);
    }

    if (nom_complet) {
      where.push(`(
        LOWER(e.nom || ' ' || e.prenom) LIKE LOWER($${params.length + 1})
        OR LOWER(e.prenom || ' ' || e.nom) LIKE LOWER($${params.length + 1})
      )`);
      params.push(`%${nom_complet}%`);
    }

    if (nas) {
      where.push(`e.nas = $${params.length + 1}`);
      params.push(nas);
    }

    if (id_hotel) {
      where.push(`e.id_hotel = $${params.length + 1}`);
      params.push(parseInt(id_hotel));
    }

    if (role) {
      where.push(`e.role = $${params.length + 1}`);
      params.push(role);
    }

    const result = await db.query(
      `
      SELECT e.*, h.nom_hotel
      FROM EMPLOYE e
      JOIN HOTEL h ON h.id_hotel = e.id_hotel
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY e.id_employe
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT e.*, h.nom_hotel
      FROM EMPLOYE e
      JOIN HOTEL h ON h.id_hotel = e.id_hotel
      WHERE e.id_employe = $1
      `,
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Employé introuvable' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    return res.status(400).json({ error: getDbErrorMessage(err) });
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { id_hotel, nom, prenom, adresse, nas, role } = req.body;
    const result = await db.query(
      'INSERT INTO EMPLOYE (id_hotel,nom,prenom,adresse,nas,role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [id_hotel, nom, prenom, adresse, nas, role]
    );
    res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
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
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      'DELETE FROM EMPLOYE WHERE id_employe = $1 RETURNING id_employe',
      [req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Employé introuvable' });
    }

    res.json({ message: 'Employé supprimé' });
  } catch (err) {
    return res.status(400).json({ error: getDbErrorMessage(err) });
  }
});

module.exports = router;
