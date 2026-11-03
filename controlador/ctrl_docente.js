const Conexion = require('../conexion/conexion');

class CtrlDocente {
    async guardar(docente) {
        const db = new Conexion();
        try {
            await db.conectar();

            const sql = `INSERT INTO docente
                (num_empleado, fecha_ingreso, id_especialidad, id_grado_academico, id_area, id_usuario, id_tipo_plaza, id_carrera)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const [resultado] = await db.conexion.execute(sql, [
                docente.numEmpleado,
                docente.fechaIngreso,
                docente.idEspecialidad,
                docente.idGradoAcademico,
                docente.idArea,
                docente.idUsuario,
                docente.idTipoPlaza,
                docente.idCarrera
            ]);

            return resultado.insertId;
        } finally {
            await db.cerrar();
        }
    }


    async obtenerPerfilCompleto(idUsuario) {
        const db = new Conexion();
        try {
            await db.conectar();
            const [rows] = await db.conexion.execute(`
                SELECT d.*, tp.nombre_plaza, ga.nombre_grado, a.nombre_area, e.nombre_especialidad, c.nombre_carrera 
                FROM docente d
                JOIN tipo_plaza tp ON d.id_tipo_plaza = tp.id_tipo_plaza
                JOIN grado_academico ga ON d.id_grado_academico = ga.id_gradoAcademico
                JOIN area a ON d.id_area = a.id_area
                JOIN especialidad e ON d.id_especialidad = e.id_especialidad
                JOIN carreras c ON d.id_carrera = c.id_carrera
                WHERE d.id_usuario = ?
            `, [idUsuario]);

            return rows[0] ?? null;
        } finally {
            await db.cerrar();
        }
    }
}

module.exports = CtrlDocente;