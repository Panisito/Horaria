class Usuario {
    constructor(nombre, correo, usuario, contrasenia, rol) {
        this.nombre = nombre;
        this.correo = correo;
        this.usuario = usuario;
        this.contrasenia = contrasenia;
        this.rol = rol;
    }
}

module.exports = Usuario;