const cumpleInput = document.getElementById('cumple');
const edadInput = document.getElementById('edad');
const fotoInput = document.getElementById('foto');
const previewImg = document.getElementById('preview');
const form = document.getElementById('formulario');
const registros = [];

// Calcular edad automáticamente al cambiar fecha de cumpleaños
cumpleInput.addEventListener('change', () => {
    const birthDate = new Date(cumpleInput.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    edadInput.value = age;
});

// Previsualización de imagen al cambiar input de foto
fotoInput.addEventListener('change', () => {
    const file = fotoInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => previewImg.src = e.target.result;
        reader.readAsDataURL(file);
    }
});

// Guardar registro al enviar formulario
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const grupoRaw = document.getElementById('grupo').value.trim();

  const gruposValidos = [
    'Solo reuniones',
    'No quiere participar en un discipulado',
    ...Array.from({ length: 15 }, (_, i) => `Grupo ${i + 1}`)
  ];

  const grupo = gruposValidos.includes(grupoRaw) ? grupoRaw : 'Sin asignar';

  const data = {
      foto: previewImg.src || 'default-photo.png',
      nombre: document.getElementById('nombre').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      cumple: document.getElementById('cumple').value,
      edad: document.getElementById('edad').value,
      contacto: document.getElementById('contacto').value.trim(),
      estado: document.getElementById('estado').value,
      hijos: document.getElementById('hijos').value,
      grupo: grupo,
      direccion: document.getElementById('direccion').value.trim(),
      fechaRegistro: new Date()
  };

  registros.push(data);
  renderTablas();
  form.reset();
  previewImg.src = '';
  edadInput.value = '';
});

// Función para agregar filtros y botones PDF
function agregarFiltros(tablaId) { 
  const tabla = document.getElementById(tablaId);
  const container = tabla.parentElement;

  let header = container.querySelector('.group-header');

  if (!header) {
    header = document.createElement('div');
    header.className = 'group-header';
    container.insertBefore(header, tabla);

    const btnToggle = container.querySelector('.toggle-btn');
    if (btnToggle && !header.contains(btnToggle)) {
      header.appendChild(btnToggle);
    }
  } else {
    const btnToggle = container.querySelector('.toggle-btn');
    if (btnToggle && !header.contains(btnToggle)) {
      header.insertBefore(btnToggle, header.firstChild);
    }
  }

  if (!container.querySelector('.pdf-btn')) {
    const grupoNombre = tablaId === 'tablaTodas' ? 'Todas las mujeres' :
                        tablaId === 'tablaSoloReuniones' ? 'Solo reuniones' :
                        tablaId === 'tablaNoDiscipulado' ? 'No quiere participar en un discipulado' :
                        tablaId.startsWith('tablaDifusionGrupo') ? `Difusión ${tablaId.replace('tablaDifusionGrupo','Grupo ')}` :
                        `Grupo ${tablaId.replace('tabla','')}`;

    const pdfBtn = document.createElement('button');
    pdfBtn.textContent = 'Descargar PDF';
    pdfBtn.className = 'pdf-btn';
    pdfBtn.style.marginLeft = 'auto';

    if (tablaId === 'tablaTodas') {
      const contenedor = document.createElement('div');
      contenedor.style.position = 'relative';
      const menu = document.createElement('div');
      menu.style.position = 'absolute';
      menu.style.top = '110%';
      menu.style.right = '0';
      menu.style.background = 'white';
      menu.style.border = '1px solid #ccc';
      menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      menu.style.borderRadius = '5px';
      menu.style.display = 'none';
      menu.style.zIndex = '999';

      const opcion1 = document.createElement('div');
      opcion1.textContent = '📄 Descargar listado completo';
      opcion1.style.padding = '8px';
      opcion1.style.cursor = 'pointer';
      opcion1.onclick = () => {
        menu.style.display = 'none';
        generarPDF(tablaId, grupoNombre);
      };

      const opcion2 = document.createElement('div');
      opcion2.textContent = '📁 Descargar por grupos';
      opcion2.style.padding = '8px';
      opcion2.style.cursor = 'pointer';
      opcion2.onclick = () => {
        menu.style.display = 'none';
        generarPDFPorGrupos();
      };

      menu.appendChild(opcion1);
      menu.appendChild(opcion2);

      pdfBtn.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      };

      contenedor.appendChild(pdfBtn);
      contenedor.appendChild(menu);
      header.appendChild(contenedor);
    } else {
      pdfBtn.onclick = () => generarPDF(tablaId, grupoNombre);
      header.appendChild(pdfBtn);
    }
  }

  if (!container.querySelector('select.filtro-select')) {
    const select = document.createElement('select');
    select.className = 'filtro-select';
    select.style.padding = '0.5rem';
    select.style.borderRadius = '5px';
    select.style.border = '1px solid #ccc';
    select.style.fontFamily = 'inherit';
    select.style.fontSize = '1rem';
    select.style.marginLeft = '1rem';
    select.style.minWidth = '180px';
    select.style.cursor = 'pointer';

    const opciones = [
      { texto: 'Ordenar A-Z', valor: 'az' },
      { texto: 'Ordenar Z-A', valor: 'za' },
      { texto: 'Últimas agregadas', valor: 'ultimas' },
      { texto: 'Primeras agregadas', valor: 'primeras' }
    ];

    opciones.forEach(op => {
      const option = document.createElement('option');
      option.value = op.valor;
      option.textContent = op.texto;
      select.appendChild(option);
    });

    select.onchange = () => {
      renderTablas(tablaId, select.value);
    };

    header.appendChild(select);
  }
}

// Configuración inicial al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  const tablas = [
    'tablaTodas',
    'tablaSoloReuniones',
    'tablaNoDiscipulado'
  ];

  // Agregar tablas de grupo y difusión (1 al 15)
  for (let i = 1; i <= 15; i++) {
    tablas.push(`tabla${i}`, `tablaDifusionGrupo${i}`);
  }

  tablas.forEach(id => {
    const tabla = document.getElementById(id);
    if (!tabla) return;

    tabla.style.display = 'table';
    agregarFiltros(id);
  });

  // Buscador en 'Todas las mujeres'
  const buscador = document.getElementById('buscadorTodas');
  if (buscador) {
    buscador.addEventListener('input', () => {
      const texto = buscador.value.trim().toLowerCase();
      renderTablas('tablaTodas', 'az', texto);
    });
  }

  // Renderizar todas las tablas
  renderTablas();
});
// Renderizar tablas según grupo, orden y filtro de texto
function renderTablas(tablaId = null, orden = 'az', filtroTexto = '') {
  const tablas = ['tablaTodas', 'tablaSoloReuniones', 'tablaNoDiscipulado'];
  for (let i = 1; i <= 15; i++) {
    tablas.push(`tabla${i}`, `tablaDifusionGrupo${i}`);
  }

  tablas.forEach(id => {
    const tabla = document.getElementById(id);
    if (!tabla) return;

    let dataFiltrada = registros.slice();

    if (id === 'tablaTodas') {
      if (filtroTexto) {
        dataFiltrada = dataFiltrada.filter(r =>
          Object.values(r).some(val =>
            String(val).toLowerCase().includes(filtroTexto)
          )
        );
      }
    } else if (id === 'tablaSoloReuniones') {
      dataFiltrada = dataFiltrada.filter(r => r.grupo === 'Solo reuniones');
    } else if (id === 'tablaNoDiscipulado') {
      dataFiltrada = dataFiltrada.filter(r => r.grupo === 'No quiere participar en un discipulado');
    } else if (id.startsWith('tablaDifusionGrupo')) {
      const n = id.replace('tablaDifusionGrupo','');
      dataFiltrada = dataFiltrada.filter(r => r.grupo === `Difusión Grupo ${n}`);
    } else {
      const n = id.replace('tabla','');
      dataFiltrada = dataFiltrada.filter(r => r.grupo === `Grupo ${n}`);
    }

    if (orden === 'az') dataFiltrada.sort((a,b) => a.nombre.localeCompare(b.nombre));
    if (orden === 'za') dataFiltrada.sort((a,b) => b.nombre.localeCompare(a.nombre));
    if (orden === 'ultimas') dataFiltrada.sort((a,b) => b.fechaRegistro - a.fechaRegistro);
    if (orden === 'primeras') dataFiltrada.sort((a,b) => a.fechaRegistro - b.fechaRegistro);

    const tbody = tabla.querySelector('tbody');
    tbody.innerHTML = '';

    dataFiltrada.forEach((r, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="foto-cell">
          <img src="${r.foto}" class="foto-thumb"/>
          <span class="edit-foto">✏️</span>
        </td>
        <td>${r.nombre}</td>
        <td>${r.apellido}</td>
        <td>${r.cumple}</td>
        <td>${r.edad}</td>
        <td class="contacto-cell">
          ${r.contacto} <span class="edit-contacto">✏️</span>
        </td>
        <td>${r.estado}</td>
        <td>${r.hijos}</td>
        <td class="grupo-cell">${r.grupo} <span class="edit-grupo">✏️</span></td>
        <td class="direccion-cell">
          ${r.direccion} <span class="edit-direccion">✏️</span>
        </td>
        <td><button class="delete-btn">🗑️</button></td>
      `;
      tbody.appendChild(tr);

      // Alertar cumpleaños
      const hoy = new Date();
      const cumple = new Date(r.cumple);
      if (cumple.getDate() === hoy.getDate() && cumple.getMonth() === hoy.getMonth()) {
        tr.style.backgroundColor = '#fff0f0';
      }

      // Editar contacto
      tr.querySelector('.edit-contacto').addEventListener('click', () => {
        const nuevo = prompt('Editar contacto:', r.contacto);
        if (nuevo !== null) {
          r.contacto = nuevo.trim();
          renderTablas(tablaId, orden, filtroTexto);
        }
      });

      // Editar direccion
      tr.querySelector('.edit-direccion').addEventListener('click', () => {
        const nuevo = prompt('Editar dirección:', r.direccion);
        if (nuevo !== null) {
          r.direccion = nuevo.trim();
          renderTablas(tablaId, orden, filtroTexto);
        }
      });

      // Editar grupo/difusión
      tr.querySelector('.edit-grupo').addEventListener('click', () => {
        let opciones = [];
        for (let i = 1; i <= 15; i++) {
          opciones.push(`Grupo ${i}`);
          if (r.grupo.startsWith('Grupo ')) {
            const n = r.grupo.replace('Grupo ','');
            opciones.push(`Difusión Grupo ${n}`);
          }
        }
        opciones.push('Solo reuniones', 'No quiere participar en un discipulado');

        const nuevo = prompt(`Asignar a: \n${opciones.join('\n')}`, r.grupo);
        if (nuevo && opciones.includes(nuevo)) {
          r.grupo = nuevo;
          renderTablas(tablaId, orden, filtroTexto);
        }
      });

      // Editar foto
      tr.querySelector('.edit-foto').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = e => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = ev => {
              r.foto = ev.target.result;
              renderTablas(tablaId, orden, filtroTexto);
            };
            reader.readAsDataURL(file);
          }
        };
        fileInput.click();
      });

      // Eliminar registro
      tr.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('¿Desea eliminar este registro?')) {
          const idx = registros.indexOf(r);
          if (idx > -1) registros.splice(idx,1);
          renderTablas(tablaId, orden, filtroTexto);
        }
      });
    });

    // Actualizar conteo
    const toggleBtn = tabla.parentElement.querySelector('.toggle-btn');
    if (toggleBtn) {
      toggleBtn.textContent = `${toggleBtn.dataset.label} (${dataFiltrada.length})`;
    }
  });
}

// Toggle de visibilidad de tablas
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const tabla = document.getElementById(targetId);
    if (!tabla) return;
    tabla.style.display = tabla.style.display === 'none' ? 'table' : 'none';
    agregarFiltros(targetId);
  });
});

// Generar PDF
function generarPDF(tablaId, grupoNombre) {
  const tabla = document.getElementById(tablaId);
  if (!tabla) return;

  const filas = Array.from(tabla.querySelectorAll('tbody tr'));
  if (filas.length === 0) {
    alert('No hay registros para exportar.');
    return;
  }

  let contenido = `<h2>${grupoNombre}</h2><table border="1" cellpadding="5" cellspacing="0" width="100%"><tr>`;
  Array.from(tabla.querySelectorAll('thead th')).forEach(th => {
    if (!th.textContent.includes('Eliminar')) contenido += `<th>${th.textContent}</th>`;
  });
  contenido += `</tr>`;

  filas.forEach(fila => {
    contenido += '<tr>';
    Array.from(fila.querySelectorAll('td')).forEach(td => {
      if (!td.querySelector('button')) {
        contenido += `<td>${td.innerText}</td>`;
      }
    });
    contenido += '</tr>';
  });
  contenido += '</table>';

  const win = window.open('', '', 'width=900,height=700');
  win.document.write('<html><head><title>PDF</title></head><body>');
  win.document.write(contenido);
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

// Generar PDF por grupos
function generarPDFPorGrupos() {
  for (let i = 1; i <= 15; i++) {
    const tabla = document.getElementById(`tabla${i}`);
    if (tabla && tabla.querySelector('tbody').children.length) {
      generarPDF(`tabla${i}`, `Grupo ${i}`);
    }
  }
}
