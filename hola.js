const Docente = require('./modelo/docente');
const CtrlDocente = require('./controlador/ctrl_docente');

async function probar() {
    const d = new Docente(1, 'Ana', 'López Pérez', 'Ingeniería en Computación', 'Bases de datos', 'Tiempo completo', 40,'ana12@gmail.com','5015');
    const ctrl = new CtrlDocente();
    const ok = await ctrl.guardar(d);
    console.log(ok ? 'Guardado' : 'No se pudo guardar');
}

probar();

