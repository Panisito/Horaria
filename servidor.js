require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./rutas/auth');
const catalogoRutas = require('./rutas/cat.js');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', catalogoRutas);

app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando' });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
