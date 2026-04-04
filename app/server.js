require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/search',       require('./routes/search'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/locations',    require('./routes/locations'));
app.use('/api/clients',      require('./routes/clients'));
app.use('/api/employes',     require('./routes/employes'));
app.use('/api/hotels',       require('./routes/hotels'));
app.use('/api/chambres',     require('./routes/chambres'));
app.use('/api/chaines',      require('./routes/chaines'));
app.use('/api/vues',         require('./routes/vues'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`e-Hôtels running on http://localhost:${PORT}`));
