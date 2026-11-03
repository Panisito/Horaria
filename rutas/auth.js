const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../modelo/usuario');
const CtrlUsuario = require('../controlador/ctrl_usuario');
const CtrlDocente = require('../controlador/ctrl_docente');
const { enviarCredenciales } = require('../servicios/correo');

const router = express.Router();
const ctrlUsuario = new CtrlUsuario();
const ctrlDocente = new CtrlDocente();

// REGISTRO
router.post('/register', async (req, res) => {
    const { nombre, correo, contrasenia } = req.body;

    if (!nombre || !correo || !contrasenia) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    const correoLimpio = correo.trim().toLowerCase();
    const usuario = correoLimpio.split('@')[0];

    try {
        const nuevo = new Usuario(nombre.trim(), correoLimpio, usuario, contrasenia, 'docente');
        const id = await ctrlUsuario.guardar(nuevo);

        let correoEnviado = true;
        try {
            console.log('Intentando enviar correo a:', correoLimpio);
            await enviarCredenciales(correoLimpio, nombre.trim(), usuario);
            console.log('¡Correo enviado con éxito!');
        } catch (errorCorreo) {
            correoEnviado = false;
            console.log('ERROR AL ENVIAR CORREO: ' + errorCorreo.message);
        }

        res.status(201).json({ mensaje: 'Usuario registrado con éxito', id, correoEnviado });
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

// LOGIN
router.post('/login', async (req, res) => {
    const { usuario, contrasenia } = req.body;

    if (!usuario || !contrasenia) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    try {
        const encontrado = await ctrlUsuario.buscar(usuario.trim().toLowerCase());

        if (!encontrado) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
        }

        // Comparamos la contraseña con bcrypt
        const coincide = await bcrypt.compare(contrasenia, encontrado.contrasenia);
        console.log("¿Resultado final de bcrypt.compare?:", coincide);

        if (!coincide) {
            return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
        }

        // CORRECCIÓN: Usamos encontrado.id_usuario en lugar de usuario.id_usuario
        const docente = await ctrlDocente.obtenerPerfilCompleto(encontrado.id_usuario);
        const perfilCompleto = docente !== null; // Usamos la variable 'docente' que acabamos de consultar

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: encontrado.id_usuario,
                nombre: encontrado.nombre_usuario,
                correo: encontrado.correo,
                usuario: encontrado.usuario,
                rol: encontrado.rol,
                perfilCompleto: perfilCompleto // <- Clave para la redirección en el frontend
            }
        });

    } catch (error) {
        console.log('Error en el login: ' + error.message);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});

module.exports = router;