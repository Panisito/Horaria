class Usuario {
    constructor(nombre, apellidos, correo, usuario, contrasenia, rol) {
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.correo = correo;
        this.usuario = usuario;
        this.contrasenia = contrasenia;
        this.rol = rol;
    }
}

module.exports = Usuario;