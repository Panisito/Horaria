const Conexion = require('../conexion/conexion');

class CtrlDocente {
    async guardar(docente) {
        const db = new Conexion();
        try {
            await db.conectar();

            const sql = `INSERT INTO docente
                (id_docente, nombre_docente, apellidos, carrera, especialidad, tipo_plaza, horas_a_la_semana,correo,contrasenia)
                VALUES (?, ?, ?, ?, ?, ?, ?,?,?)`;

            const [resultado] = await db.conexion.execute(sql, [
                docente.id,
                docente.nombre,
                docente.apellidos,
                docente.carrera,
                docente.especialidad,
                docente.tipoPlaza,
                docente.horasSemana,
                docente.correo,
                docente.contrasenia
            ]);

            return resultado.affectedRows > 0;
        } catch (error) {
            console.log('Error al guardar: ' + error.message);
            return false;
        } finally {
            await db.cerrar();
        }
    }
}

module.exports = CtrlDocente;