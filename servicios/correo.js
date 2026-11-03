const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.CORREO_USER,
        pass: process.env.CORREO_PASS
    }
});

async function enviarCredenciales(destino, nombre, usuario) {
    await transporter.sendMail({
        from: `"Sistema de horarios" <${process.env.CORREO_USER}>`,
        to: destino,
        subject: 'Tu usuario de acceso al sistema de horarios',
        text: `Hola ${nombre},\n\nTu cuenta ha sido registrada con éxito en el sistema de horarios.\n\nTu nombre de usuario para iniciar sesión es: ${usuario}\n\nUsa la contraseña que creaste durante tu registro.`
    });
}

module.exports = { enviarCredenciales };