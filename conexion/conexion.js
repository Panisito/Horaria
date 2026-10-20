
const mysql = require('mysql2/promise');

class Conexion {
    constructor() {
        this.conexion = null;
    }

    async conectar() {
        this.conexion = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '50152005',
            database: 'escuela_FIS'
        });

        console.log('Conexión exitosa a MySQL');
    }

    async cerrar() {
        if (this.conexion) {
            await this.conexion.end();
            this.conexion = null;
            console.log('Conexión cerrada');
        }
    }
}

module.exports = Conexion;
