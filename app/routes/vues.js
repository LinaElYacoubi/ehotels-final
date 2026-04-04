const router = require('express').Router();
const db = require('../db');

router.get('/chambres-par-zone', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM vue_chambres_disponibles_par_zone');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/capacite-par-hotel', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM vue_capacite_par_hotel');
    res.json(result.rows);
  } catch (err) { next(err); }
});

module.exports = router;
