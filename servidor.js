const authRoutes = require('./rutas/auth')
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor funcionando' });
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});