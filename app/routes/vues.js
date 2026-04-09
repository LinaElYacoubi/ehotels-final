const router = require('express').Router();
const db = require('../db');
const { getDbErrorMessage } = require('../utils/dbErrorMessage');

router.get('/chambres-par-zone', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM vue_chambres_disponibles_par_zone');
    res.json(result.rows);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

router.get('/capacite-par-hotel', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM vue_capacite_par_hotel');
    res.json(result.rows);
    } catch (err) {
      return res.status(400).json({ error: getDbErrorMessage(err) });
    }
});

module.exports = router;
