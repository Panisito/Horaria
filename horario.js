const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const TURNOS = {
  matutino:   [7, 8, 9, 10, 11, 12, 13, 14],
  vespertino: [12, 13, 14, 15, 16, 17, 18, 19]
};

const MATERIAS = {
  calc:    { nombre: 'Cálculo Diferencial',              semestre: 1, horas: 5, creditos: 5 },
  prog:    { nombre: 'Fundamentos de Programación',      semestre: 1, horas: 5, creditos: 5 },
  etica:   { nombre: 'Taller de Ética',                  semestre: 1, horas: 4, creditos: 4 },
  mate:    { nombre: 'Matemáticas Discretas',            semestre: 1, horas: 5, creditos: 5 },
  admin:   { nombre: 'Taller de Administración',         semestre: 1, horas: 4, creditos: 4 },
  inv:     { nombre: 'Fundamentos de Investigación',     semestre: 1, horas: 4, creditos: 4 },
  calcint: { nombre: 'Cálculo Integral',                 semestre: 2, horas: 5, creditos: 5 },
  poo:     { nombre: 'Programación Orientada a Objetos', semestre: 2, horas: 5, creditos: 5 }
};

const PROFESORES = [
  { id: 'p1', nombre: 'Profesor 1', noEmp: '1001', materias: ['calc', 'mate'],
    correo: 'profesor1@ejemplo.edu.mx', area: 'Ciencias Básicas', grado: 'Maestría', especialidad: 'Matemáticas', categoria: 'Profesor de asignatura', ingreso: 'Agosto 2019' },
  { id: 'p2', nombre: 'Profesor 2', noEmp: '1002', materias: ['calc', 'prog'],
    correo: 'profesor2@ejemplo.edu.mx', area: 'Sistemas Computacionales', grado: 'Doctorado', especialidad: 'Ciencias de la Computación', categoria: 'Profesor de tiempo completo', ingreso: 'Enero 2016' },
  { id: 'p3', nombre: 'Profesor 3', noEmp: '1003', materias: ['etica', 'admin', 'inv'],
    correo: 'profesor3@ejemplo.edu.mx', area: 'Ciencias Sociales y Administrativas', grado: 'Maestría', especialidad: 'Administración', categoria: 'Profesor de asignatura', ingreso: 'Febrero 2021' },
  { id: 'p4', nombre: 'Profesor 4', noEmp: '1004', materias: ['calcint', 'poo'],
    correo: 'profesor4@ejemplo.edu.mx', area: 'Sistemas Computacionales', grado: 'Licenciatura', especialidad: 'Desarrollo de software', categoria: 'Profesor de asignatura', ingreso: 'Agosto 2023' }
];

let sesionId = null;
try { sesionId = sessionStorage.getItem('profesorId'); } catch (e) {}
const PROFESOR_ID = (PROFESORES.find(p => p.id === sesionId) || PROFESORES[0]).id;

const $ = id => document.getElementById(id);
const IDS_MAT = Object.keys(MATERIAS);

let memoria = {};
let sel = {};

const llave = () =>
  [$('profesor').value, $('semestre').value, $('grupo').value, $('turno').value].join('|');

function cargarContexto() {
  const k = llave();
  if (!memoria[k]) memoria[k] = {};
  sel = memoria[k];
}

const profActual = () => PROFESORES.find(p => p.id === $('profesor').value);
const colorDe    = id => (IDS_MAT.indexOf(id) % 6) + 1;
const esLab      = aula => aula.startsWith('LAB');
const aviso      = t => { $('aviso').textContent = t; };
const asignadas  = id => Object.values(sel).filter(c => c.materia === id).length;

function llenarProfesores() {
  const p = PROFESORES.find(x => x.id === PROFESOR_ID);
  $('profesor').innerHTML = `<option value="${p.id}">${p.nombre}</option>`;
  $('profesor').disabled = true;
}

function llenarMaterias() {
  const sem = +$('semestre').value;
  const ids = profActual().materias.filter(id => MATERIAS[id].semestre === sem);
  $('materia').innerHTML = ids.length
    ? '<option value="">Selecciona una materia</option>' +
      ids.map(id => `<option value="${id}">${MATERIAS[id].nombre}</option>`).join('')
    : '<option value="">Sin materias en este semestre</option>';
}

function render() {
  const tbody = $('tabla-horario');
  tbody.innerHTML = '';

  TURNOS[$('turno').value].forEach(hora => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${hora}-${hora + 1}</th>`;

    DIAS.forEach((nombreDia, dia) => {
      const td = document.createElement('td');
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.dia = dia;
      b.dataset.hora = hora;
      b.setAttribute('aria-label', `${nombreDia} ${hora}-${hora + 1}`);

      const c = sel[`${dia}-${hora}`];
      if (c) {
        b.className = `sel mat-${colorDe(c.materia)}`;
        b.innerHTML = `${MATERIAS[c.materia].nombre}<small>${esLab(c.aula) ? 'LABORATORIO · ' : ''}${c.aula}</small>`;
      }

      td.appendChild(b);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  renderAsignaturas();
  resumen();
}

function renderAsignaturas() {
  const sem = +$('semestre').value;
  const grupo = $('grupo').value;
  const ids = IDS_MAT.filter(id => MATERIAS[id].semestre === sem);
  let total = 0;

  $('tabla-asignaturas').innerHTML = ids.map(id => {
    const m = MATERIAS[id];
    const p = asignadas(id) ? profActual() : null;
    total += m.horas;
    return `<tr>
      <td class="num">${grupo}</td>
      <td>${m.nombre}</td>
      <td class="num">${asignadas(id)}/${m.horas}</td>
      <td class="num">${m.creditos}</td>
      <td>${p ? p.nombre : ''}</td>
      <td class="num">${p ? p.noEmp : ''}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="6">Sin asignaturas para este semestre</td></tr>';

  $('total-horas-mat').textContent = total;
}

function resumen() {
  const celdas = Object.keys(sel).map(k => k.split('-').map(Number));
  $('total-horas').textContent = celdas.length;

  let muertas = 0;
  DIAS.forEach((_, dia) => {
    const horas = celdas.filter(c => c[0] === dia).map(c => c[1]);
    if (horas.length) muertas += (Math.max(...horas) - Math.min(...horas) + 1) - horas.length;
  });
  $('horas-muertas').textContent = muertas;
}

$('tabla-horario').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  const k = `${b.dataset.dia}-${b.dataset.hora}`;

  if (sel[k]) {
    delete sel[k];
    aviso('');
    return render();
  }

  const mat = $('materia').value;
  if (!mat) return aviso('Primero selecciona una materia.');
  if (asignadas(mat) >= MATERIAS[mat].horas) {
    return aviso('Esta materia ya tiene todas sus horas asignadas.');
  }

  sel[k] = { materia: mat, aula: $('aula').value };
  aviso('');
  render();
});

['profesor', 'semestre', 'grupo', 'turno'].forEach(id => {
  $(id).addEventListener('change', () => {
    if (id === 'profesor' || id === 'semestre') llenarMaterias();
    cargarContexto();
    aviso('');
    render();
  });
});

const paneles = document.querySelectorAll('.contenido');
const mostrar = id => paneles.forEach(p => p.classList.toggle('activa', p.id === id));

$('btn-subir').addEventListener('click', e => {
  e.preventDefault();
  mostrar('subir');
});

$('btn-inicio').addEventListener('click', e => {
  e.preventDefault();
  renderInicio();
  mostrar('inicio');
});

$('btn-documentos').addEventListener('click', e => {
  e.preventDefault();
  renderDocumentos();
  mostrar('documentos');
});

$('btn-calendario').addEventListener('click', e => {
  e.preventDefault();
  mostrar('calendario');
});

$('btn-perfil').addEventListener('click', e => {
  e.preventDefault();
  renderPerfil();
  mostrar('perfil');
});

$('btn-todos').addEventListener('click', e => {
  e.preventDefault();
  renderTodos();
  mostrar('todos');
});

$('btn-consultar').addEventListener('click', e => {
  e.preventDefault();
  renderConsulta();
  mostrar('consultar');
});

document.querySelectorAll('.nav__link').forEach(a => {
  if (['btn-inicio', 'btn-subir', 'btn-consultar', 'btn-perfil', 'btn-calendario', 'btn-documentos', 'btn-todos'].includes(a.id) || a.closest('.list__button--click')) return;
  a.addEventListener('click', () => mostrar(null));
});

function htmlGrupo(k, datos) {
  const [, sem, grupo, turno] = k.split('|');

  const filas = TURNOS[turno].map(h => {
    const celdas = DIAS.map((_, d) => {
      const c = datos[`${d}-${h}`];
      return c
        ? `<td><button type="button" class="sel mat-${colorDe(c.materia)}" disabled>${MATERIAS[c.materia].nombre}<small>${esLab(c.aula) ? 'LABORATORIO · ' : ''}${c.aula}</small></button></td>`
        : '<td><button type="button" disabled></button></td>';
    }).join('');
    return `<tr><th>${h}-${h + 1}</th>${celdas}</tr>`;
  }).join('');

  const mats = {};
  Object.values(datos).forEach(c => {
    if (!mats[c.materia]) mats[c.materia] = { horas: 0, aulas: new Set() };
    mats[c.materia].horas++;
    mats[c.materia].aulas.add(c.aula);
  });

  let horas = 0, creditos = 0;
  const filasMat = Object.entries(mats).map(([id, m]) => {
    horas += m.horas;
    creditos += MATERIAS[id].creditos;
    return `<tr>
      <td>${MATERIAS[id].nombre}</td>
      <td class="num">${m.horas}/${MATERIAS[id].horas}</td>
      <td class="num">${MATERIAS[id].creditos}</td>
      <td>${[...m.aulas].join(', ')}</td>
    </tr>`;
  }).join('');

  const html = `
    <div class="tarjeta">
      <h2 class="consulta__titulo">${sem}° semestre · Grupo ${grupo} · ${turno === 'matutino' ? 'Matutino' : 'Vespertino'}</h2>
      <div class="tabla-scroll">
        <table class="horario horario--lectura">
          <thead><tr><th>Horario</th>${DIAS.map(d => `<th>${d}</th>`).join('')}</tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
      <div class="tabla-scroll">
        <table class="asignaturas">
          <thead><tr><th>Asignaturas</th><th>Horas</th><th>Créditos</th><th>Aula</th></tr></thead>
          <tbody>${filasMat}</tbody>
          <tfoot><tr><td>Total</td><td class="num">${horas}</td><td class="num">${creditos}</td><td></td></tr></tfoot>
        </table>
      </div>
    </div>`;
  return { html, horas };
}

const gruposDe = pid => Object.entries(memoria)
  .filter(([k, datos]) => k.startsWith(pid + '|') && Object.keys(datos).length)
  .sort((a, b) => a[0].localeCompare(b[0]));

function renderConsulta() {
  const entradas = gruposDe(PROFESOR_ID);
  const cont = $('consulta-contenido');
  let totalHoras = 0;

  $('c-nombre').textContent = PROFESORES.find(p => p.id === PROFESOR_ID).nombre;
  cont.innerHTML = entradas.length
    ? ''
    : '<div class="tarjeta"><p class="vacio">Aún no has seleccionado horas en "Subir".</p></div>';

  entradas.forEach(([k, datos]) => {
    const g = htmlGrupo(k, datos);
    totalHoras += g.horas;
    cont.insertAdjacentHTML('beforeend', g.html);
  });

  $('c-total-horas').textContent = totalHoras;
  $('c-total-grupos').textContent = entradas.length;
}

function renderTodos() {
  const texto = $('t-buscar').value.trim().toLowerCase();
  const turno = $('t-turno').value;
  const cont = $('todos-contenido');

  const lista = PROFESORES.filter(p =>
    p.nombre.toLowerCase().includes(texto) || p.noEmp.includes(texto));

  let totalHoras = 0, totalGrupos = 0, conCarga = 0;
  const idsConCarga = [];
  cont.innerHTML = '';

  lista.forEach(p => {
    let entradas = gruposDe(p.id);
    if (turno) entradas = entradas.filter(([k]) => k.split('|')[3] === turno);

    let horas = 0;
    const materias = new Set();
    const grupos = entradas.map(([k, datos]) => {
      const g = htmlGrupo(k, datos);
      horas += g.horas;
      Object.values(datos).forEach(c => materias.add(c.materia));
      return g.html;
    }).join('');

    totalHoras += horas;
    totalGrupos += entradas.length;
    if (entradas.length) { conCarga++; idsConCarga.push(p.id); }

    cont.insertAdjacentHTML('beforeend', `
      <details class="tarjeta prof-detalle" ${lista.length === 1 ? 'open' : ''}>
        <summary>
          <span class="prof-detalle__nombre">${p.nombre}<small>No. emp. ${p.noEmp} · ${p.area}</small></span>
          <span class="prof-detalle__dato"><strong>${horas}</strong> horas</span>
          <span class="prof-detalle__dato"><strong>${entradas.length}</strong> grupos</span>
          <span class="prof-detalle__dato"><strong>${materias.size}</strong> materias</span>
          ${entradas.length ? `<button type="button" class="btn-pdf" data-pid="${p.id}">Descargar PDF</button>` : ''}
        </summary>
        <div class="prof-detalle__cuerpo">
          ${grupos || '<p class="vacio">Este profesor aún no ha subido su horario.</p>'}
        </div>
      </details>`);
  });

  if (!lista.length) cont.innerHTML = '<div class="tarjeta"><p class="vacio">No hay profesores que coincidan con la búsqueda.</p></div>';

  $('t-profes').textContent = `${conCarga}/${lista.length}`;
  $('t-horas').textContent = totalHoras;
  $('t-grupos').textContent = totalGrupos;
  $('t-pdf').disabled = !idsConCarga.length;
  $('t-pdf').dataset.ids = idsConCarga.join(',');
}

function imprimirProfesores(ids) {
  const turno = $('t-turno').value;
  const html = ids.map(pid => {
    const prof = PROFESORES.find(p => p.id === pid);
    let entradas = gruposDe(pid);
    if (turno) entradas = entradas.filter(([k]) => k.split('|')[3] === turno);
    return entradas.map(([k, datos]) => htmlHoja(prof, k, datos)).join('');
  }).join('');
  if (!html) return;

  const zona = $('zona-impresion');
  const titulo = document.title;
  zona.innerHTML = html;
  document.body.classList.add('imprimiendo');
  document.title = ids.length === 1
    ? 'Horario_' + PROFESORES.find(p => p.id === ids[0]).nombre.replace(/\s+/g, '_')
    : 'Horarios_profesores';

  const limpiar = () => {
    window.removeEventListener('afterprint', limpiar);
    document.body.classList.remove('imprimiendo');
    zona.innerHTML = '';
    document.title = titulo;
  };
  window.addEventListener('afterprint', limpiar);
  window.print();
}

$('t-pdf').addEventListener('click', () => {
  const ids = $('t-pdf').dataset.ids;
  if (ids) imprimirProfesores(ids.split(','));
});

$('todos-contenido').addEventListener('click', e => {
  const b = e.target.closest('.btn-pdf');
  if (!b) return;
  e.preventDefault();
  imprimirProfesores([b.dataset.pid]);
});

$('t-buscar').addEventListener('input', renderTodos);
$('t-turno').addEventListener('change', renderTodos);

const fotos = {};

const iniciales = nombre => nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

function renderPerfil() {
  const p = PROFESORES.find(x => x.id === PROFESOR_ID);

  $('p-nombre').textContent = p.nombre;
  $('p-categoria').textContent = p.categoria;

  const campos = [
    ['No. de empleado',     p.noEmp],
    ['Correo institucional', p.correo],
    ['Programa educativo',  'Ingeniería en Sistemas Computacionales'],
    ['Área',                p.area],
    ['Grado académico',     p.grado],
    ['Especialidad',        p.especialidad],
    ['Fecha de ingreso',    p.ingreso]
  ];
  $('p-datos').innerHTML = campos
    .map(([etiqueta, valor]) => `<div class="dato-perfil"><span>${etiqueta}</span><strong>${valor}</strong></div>`)
    .join('');

  const foto = fotos[p.id];
  $('p-img').hidden = !foto;
  if (foto) $('p-img').src = foto;
  $('p-iniciales').hidden = !!foto;
  $('p-iniciales').textContent = iniciales(p.nombre);
  $('p-quitar').hidden = !foto;

  let horas = 0, creditos = 0;
  $('p-materias').innerHTML = p.materias.map(id => {
    const m = MATERIAS[id];
    horas += m.horas;
    creditos += m.creditos;
    return `<tr>
      <td>${m.nombre}</td>
      <td class="num">${m.semestre}°</td>
      <td class="num">${m.horas}</td>
      <td class="num">${m.creditos}</td>
    </tr>`;
  }).join('');
  $('p-total-horas').textContent = horas;
  $('p-total-creditos').textContent = creditos;
}

$('p-subir').addEventListener('click', () => $('p-archivo').click());

$('p-archivo').addEventListener('change', e => {
  const archivo = e.target.files[0];
  e.target.value = '';
  if (!archivo) return;

  if (!archivo.type.startsWith('image/')) {
    $('p-error').textContent = 'El archivo debe ser una imagen (JPG, PNG...).';
    return;
  }
  if (archivo.size > 5 * 1024 * 1024) {
    $('p-error').textContent = 'La imagen pesa más de 5 MB.';
    return;
  }

  const lector = new FileReader();
  lector.onload = () => {
    fotos[PROFESOR_ID] = lector.result;
    $('p-error').textContent = '';
    renderPerfil();
  };
  lector.readAsDataURL(archivo);
});

$('p-quitar').addEventListener('click', () => {
  delete fotos[PROFESOR_ID];
  renderPerfil();
});

const esc = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function htmlHoja(prof, k, datos) {
  const [, sem, grupo, turno] = k.split('|');

  const filas = TURNOS[turno].map(h => {
    const celdas = DIAS.map((_, d) => {
      const c = datos[`${d}-${h}`];
      return c
        ? `<td>${MATERIAS[c.materia].nombre}${esLab(c.aula) ? '<span class="lab">(LABORATORIO)</span>' : ''}<span class="aula">${c.aula}</span></td>`
        : '<td></td>';
    }).join('');
    return `<tr><th>${h}-${h + 1}</th>${celdas}</tr>`;
  }).join('');

  const horasPorMateria = {};
  Object.values(datos).forEach(c => { horasPorMateria[c.materia] = (horasPorMateria[c.materia] || 0) + 1; });

  let totalHoras = 0, totalCreditos = 0;
  const filasAsig = IDS_MAT.filter(id => horasPorMateria[id]).map(id => {
    totalHoras += horasPorMateria[id];
    totalCreditos += MATERIAS[id].creditos;
    return `<tr>
      <td class="c">${grupo}</td>
      <td>${MATERIAS[id].nombre}</td>
      <td class="c">${horasPorMateria[id]}</td>
      <td class="c">${MATERIAS[id].creditos}</td>
      <td>${prof.nombre}</td>
      <td class="c">${prof.noEmp}</td>
    </tr>`;
  }).join('');

  return `
    <section class="hoja">
      <div class="hoja__cab">
        <span class="hoja__gob">Gobierno del Estado de México</span>
        <div class="hoja__titulo"><strong>Horario de clase</strong><span>FO-TESH-39</span></div>
        <span class="hoja__inst"><strong>TESH</strong>Tecnológico de Estudios Superiores de Huixquilucan</span>
      </div>

      <p class="hoja__programa"><b>Programa Educativo:</b> ${esc($('programa').value)}</p>
      <div class="hoja__datos">
        <span><b>Semestre:</b> ${sem}°</span>
        <span><b>Grupo:</b> ${grupo}</span>
        <span><b>Turno:</b> ${turno === 'matutino' ? 'Matutino' : 'Vespertino'}</span>
        <span><b>Periodo:</b> ${esc($('periodo').value)}</span>
      </div>

      <table class="formato">
        <thead><tr><th>Horario</th>${DIAS.map(d => `<th>${d}</th>`).join('')}</tr></thead>
        <tbody>${filas}</tbody>
      </table>

      <table class="formato formato--asig">
        <thead><tr><th>Grupo</th><th>Asignaturas</th><th>Horas</th><th>Créditos</th><th>Profesor</th><th>No. emp.</th></tr></thead>
        <tbody>${filasAsig}</tbody>
        <tfoot><tr><td colspan="2">Total</td><td class="c">${totalHoras}</td><td class="c">${totalCreditos}</td><td colspan="2"></td></tr></tfoot>
      </table>
    </section>`;
}

function renderDocumentos() {
  const prof = PROFESORES.find(p => p.id === PROFESOR_ID);
  const entradas = gruposDe(PROFESOR_ID);

  $('d-vacio').hidden = entradas.length > 0;
  $('d-imprimir').disabled = !entradas.length;
  $('doc-hojas').innerHTML = entradas.map(([k, datos]) => htmlHoja(prof, k, datos)).join('');
}

$('d-imprimir').addEventListener('click', () => {
  document.body.classList.remove('imprimiendo');
  const titulo = document.title;
  const prof = PROFESORES.find(p => p.id === PROFESOR_ID);
  document.title = 'Horario_' + prof.nombre.replace(/\s+/g, '_');
  window.print();
  document.title = titulo;
});

const hh = n => String(n).padStart(2, '0') + ':00';

function renderInicio() {
  const prof = PROFESORES.find(p => p.id === $('profesor').value);
  const ahora = new Date();
  const horaAct = ahora.getHours();

  const saludo = horaAct < 12 ? 'Buenos días' : horaAct < 19 ? 'Buenas tardes' : 'Buenas noches';
  const fecha = ahora.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('i-fecha').textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  $('i-saludo').textContent = `${saludo}, ${prof.nombre}`;
  $('i-categoria').textContent = prof.categoria;

  const foto = fotos[prof.id];
  $('i-img').hidden = !foto;
  if (foto) $('i-img').src = foto;
  $('i-iniciales').hidden = !!foto;
  $('i-iniciales').textContent = iniciales(prof.nombre);

  const entradas = Object.entries(memoria)
    .filter(([k, d]) => k.startsWith(prof.id + '|') && Object.keys(d).length);
  const materias = new Set();
  let horas = 0;
  entradas.forEach(([, d]) => Object.values(d).forEach(c => { horas++; materias.add(c.materia); }));
  $('i-horas').textContent = horas;
  $('i-grupos').textContent = entradas.length;
  $('i-materias').textContent = materias.size;

  const cont = $('i-hoy');
  const hoy = (ahora.getDay() + 6) % 7;

  if (hoy > 4) {
    cont.innerHTML = '<p class="vacio">Hoy es fin de semana, no hay clases.</p>';
    return;
  }
  if (!entradas.length) {
    cont.innerHTML = '<p class="vacio">Aún no has marcado horas. Ve a "Subir" para armar tu horario.</p>';
    return;
  }

  const bloques = [];
  entradas.forEach(([k, d]) => {
    const [, sem, grupo] = k.split('|');
    Object.entries(d).forEach(([kk, c]) => {
      const [dia, hora] = kk.split('-').map(Number);
      if (dia === hoy) bloques.push({ hora, materia: c.materia, aula: c.aula, grupo, sem });
    });
  });
  bloques.sort((a, b) => a.hora - b.hora);

  const clases = [];
  bloques.forEach(b => {
    const u = clases[clases.length - 1];
    if (u && u.fin === b.hora && u.materia === b.materia && u.aula === b.aula && u.grupo === b.grupo && u.sem === b.sem) {
      u.fin++;
    } else {
      clases.push({ ...b, inicio: b.hora, fin: b.hora + 1 });
    }
  });

  if (!clases.length) {
    cont.innerHTML = '<p class="vacio">Hoy no tienes clases en tu horario.</p>';
    return;
  }

  let proximaMarcada = false;
  cont.innerHTML = clases.map(c => {
    let estado, etiqueta;
    if (c.fin <= horaAct)         { estado = 'pasada';    etiqueta = 'Terminada'; }
    else if (c.inicio <= horaAct) { estado = 'ahora';     etiqueta = 'En curso'; }
    else if (!proximaMarcada)     { estado = 'proxima';   etiqueta = 'Próxima'; proximaMarcada = true; }
    else                          { estado = 'pendiente'; etiqueta = 'Más tarde'; }

    return `<div class="clase-hoy clase-hoy--${estado}">
      <span class="clase-hoy__hora">${hh(c.inicio)} – ${hh(c.fin)}</span>
      <span class="clase-hoy__info">
        <strong>${MATERIAS[c.materia].nombre}</strong>
        <small>${c.sem}° semestre · Grupo ${c.grupo} · ${esLab(c.aula) ? 'Laboratorio' : 'Aula'} ${c.aula}</small>
      </span>
      <span class="clase-hoy__estado estado--${estado}">${etiqueta}</span>
    </div>`;
  }).join('');
}

$('i-ir-subir').addEventListener('click', () => $('btn-subir').click());
$('i-ir-calendario').addEventListener('click', () => $('btn-calendario').click());
$('i-ir-documentos').addEventListener('click', () => $('btn-documentos').click());

llenarProfesores();
llenarMaterias();
cargarContexto();
render();
renderInicio();
mostrar('inicio');