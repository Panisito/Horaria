const Conexion = require('../conexion/conexion');

class CtrlDocente {
    async guardar(docente) {
        const db = new Conexion();
        try {
            await db.conectar();

            const sql = `INSERT INTO docente(carrera, especialidad, id_tipo_plaza, id_usuario)
                VALUES (?, ?, ?, ?)`;

            const [resultado] = await db.conexion.execute(sql, [
                docente.carrera ?? null,
                docente.especialidad ?? null,
                docente.idTipoPlaza ?? null,
                docente.idUsuario
            ]);

            return resultado.insertId;
        } finally {
            await db.cerrar();
        }
    }
}

module.exports = CtrlDocente;