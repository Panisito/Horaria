const bcrypt = require('bcrypt');
const Conexion = require('../conexion/conexion');

class CtrlUsuario {
    async guardar(usuario) {
        const db = new Conexion();
        try {
            await db.conectar();

            const hash = await bcrypt.hash(usuario.contrasenia, 10);

            const sql = `INSERT INTO usuarios
                (nombre_usuario, apellidos, correo, usuario, contrasenia, rol)
                VALUES (?, ?, ?, ?, ?, ?)`;

            const [resultado] = await db.conexion.execute(sql, [
                usuario.nombre,
                usuario.apellidos,
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
}

module.exports = CtrlUsuario;