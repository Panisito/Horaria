const express = require('express');
const crypto = require('crypto');
const Usuario = require('../modelo/usuario');
const CtrlUsuario = require('../controlador/ctrl_usuario');

const router = express.Router();
const ctrlUsuario = new CtrlUsuario();

router.post('/register', async (req, res) => {
    const { nombre, apellidos, correo } = req.body;

    if (!nombre || !apellidos || !correo) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    // El usuario es la parte del correo antes del @
    const usuario = correo.split('@')[0];

    // Contraseña aleatoria de 10 caracteres
    const contrasenia = crypto.randomBytes(8).toString('base64url').slice(0, 10);

    try {
        // El rol siempre es 'docente' aquí; nunca viene del frontend
        const nuevo = new Usuario(nombre, apellidos, correo, usuario, contrasenia, 'docente');
        const id = await ctrlUsuario.guardar(nuevo);

        // TEMPORAL para pruebas: borrar cuando exista el envío de correo
        console.log(`Usuario: ${usuario} | Contraseña: ${contrasenia}`);

        res.status(201).json({ mensaje: 'Usuario registrado', id });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ mensaje: 'Ese correo ya está registrado' });
        }
        if (error.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
            return res.status(400).json({ mensaje: 'El correo debe ser institucional' });
        }
        console.log('Error al registrar: ' + error.message);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});

module.exports = router;