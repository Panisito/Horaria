const bcrypt = require('bcrypt');
const Conexion = require('../conexion/conexion');

class CtrlUsuario {
    async guardar(usuario) {
        const db = new Conexion();
        try {
            await db.conectar();

            const hash = await bcrypt.hash(usuario.contrasenia, 10);

            const sql = `INSERT INTO usuarios
                (nombre_usuario, correo, usuario, contrasenia, rol)
                VALUES (?, ?, ?, ?, ?)`;

            const [resultado] = await db.conexion.execute(sql, [
                usuario.nombre,
                usuario.correo,
                usuario.usuario,
                hash,
                usuario.rol ?? 'docente'
            ]);

            return resultado.insertId;
        } finally {
            await db.cerrar();
        }
    }

    // Busca por usuario o por correo (sirve para el login)
    async buscar(valor) {
        const db = new Conexion();
        try {
            await db.conectar();

            const [filas] = await db.conexion.execute(
                'SELECT * FROM usuarios WHERE usuario = ? OR correo = ?',
                [valor, valor]
            );

            return filas[0] ?? null;
        } finally {
            await db.cerrar();
        }
    }
}

module.exports = CtrlUsuario;