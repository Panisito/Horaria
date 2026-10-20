class Docente {
    constructor(id, nombre, apellidos, carrera, especialidad, tipoPlaza, horasSemana,correo,contrasenia) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.carrera = carrera;
        this.especialidad = especialidad;
        this.tipoPlaza = tipoPlaza;
        this.horasSemana = horasSemana;
        this.correo=correo;
        this.contrasenia=contrasenia;
    }
}

module.exports = Docente;
