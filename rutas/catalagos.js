const express = require('express');
const router = express.Router();
const Conexion = require('../conexion/conexion');

//  Obtener todos los catálogos para los menús desplegables del frontend
router.get('/catalogos', async (req, res) => {
    const db = new Conexion();
    try {
        await db.conectar();
        
        const [tiposPlaza] = await db.conexion.execute('SELECT * FROM tipo_plaza');
        const [grados] = await db.conexion.execute('SELECT * FROM grado_academico');
        const [areas] = await db.conexion.execute('SELECT * FROM area');
        const [especialidades] = await db.conexion.execute('SELECT * FROM especialidad');
        const [carreras] = await db.conexion.execute('SELECT * FROM carreras');

        res.json({
            tiposPlaza,
            grados,
            areas,
            especialidades,
            carreras
        });
    } catch (error) {
        console.error('Error al obtener catálogos:', error);
        res.status(500).json({ mensaje: 'Error al cargar los catálogos' });
    } finally {
        await db.cerrar();
    }
});

// 2. Guardar o completar el perfil del docente con los IDs seleccionados
router.post('/docente/completar', async (req, res) => {
    const { idUsuario, numEmpleado, fechaIngreso, idEspecialidad, idArea, idTipoPlaza, idCarrera, idGradoAcademico } = req.body;

    const db = new Conexion();
    try {
        await db.conectar();

        const sql = `INSERT INTO docente 
            (id_usuario, num_empleado, fecha_ingreso, id_especialidad, id_area, id_tipo_plaza, id_carrera, id_grado_academico) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.conexion.execute(sql, [
            idUsuario,
            numEmpleado,
            fechaIngreso,
            idEspecialidad,
            idArea,
            idTipoPlaza,
            idCarrera,
            idGradoAcademico
        ]);

        res.json({ mensaje: 'Perfil completado con éxito' });
    } catch (error) {
        console.error('Error al guardar perfil del docente:', error);
        res.status(500).json({ mensaje: 'Error al guardar el perfil' });
    } finally {
        await db.cerrar();
    }
});

// Ruta para consultar la información del docente y mostrarla en tarjetas
router.get('/docente/info/:idUsuario', async (req, res) => {
    const { idUsuario } = req.params;
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

        if (rows.length === 0) {
            return res.json({ registrado: false });
        }

        res.json({ registrado: true, ...rows[0] });
    } catch (error) {
        console.error('Error al obtener info del docente:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    } finally {
        await db.cerrar();
    }
});

module.exports = router;
