

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


// Función para agregar filtros y botones PDF (igual que antes, pero sin difusión)
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
                        `Grupo ${tablaId.replace('tabla', '')}`;

    if (tablaId === 'tablaTodas') {
      const contenedor = document.createElement('div');
      contenedor.style.position = 'relative';

      const btnPrincipal = document.createElement('button');
      btnPrincipal.textContent = 'Descargar PDF';
      btnPrincipal.className = 'pdf-btn';
      btnPrincipal.style.marginLeft = 'auto';

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

      btnPrincipal.onclick = (e) => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      };

      contenedor.appendChild(btnPrincipal);
      contenedor.appendChild(menu);
      header.appendChild(contenedor);
    } else {
      const pdfBtn = document.createElement('button');
      pdfBtn.textContent = 'Descargar PDF';
      pdfBtn.className = 'pdf-btn';
      pdfBtn.style.marginLeft = 'auto';
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

// Al cargar la página, configurar tablas fijas sin difusión
window.addEventListener('DOMContentLoaded', () => {
  const tablas = [
    'tablaTodas',
    'tablaSoloReuniones',
    'tablaNoDiscipulado'
  ];

  // Agregar tablas de grupo y difusión (1 al 15)
  for (let i = 1; i <= 15; i++) {
    tablas.push(`tabla${i}`);
    tablas.push(`tablaDifusionGrupo${i}`);
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


// Renderizar tablas con datos filtrados y ordenados
function renderTablas(tablaId = null, orden = 'az', filtroTexto = '') {
  const tablas = ['tablaTodas', 'tablaSoloReuniones', 'tablaNoDiscipulado'];
  for (let i = 1; i <= 15; i++) {
    tablas.push(`tabla${i}`, `tablaDifusionGrupo${i}`);
  }
  tablas.push('difusion_soloreu', 'difusion_nodiscip', 'tablaDifusionTodas'); // tabla difusión general

  tablas.forEach(id => {
    if (tablaId && id !== tablaId) return;
    const tabla = document.getElementById(id);
    if (!tabla) return;

    const tbody = tabla.querySelector('tbody');
    let grupo = null;

    // Determinar tipo de tabla
    if (id === 'tablaTodas') grupo = null;
    else if (id === 'tablaSoloReuniones') grupo = 'solo reuniones';
    else if (id === 'tablaNoDiscipulado') grupo = 'no quiere participar en un discipulado';
    else if (id === 'tablaDifusionTodas') grupo = 'difusión';
    else if (id.startsWith('tablaDifusionGrupo')) {
      const num = id.replace('tablaDifusionGrupo','').trim();
      grupo = `difusión grupo ${num}`;
    } else if (id.startsWith('difusion')) {
      grupo = id.replace('difusion_', 'difusión ').replace('grupo', 'grupo ');
    } else {
      const num = id.replace('tabla', '');
      grupo = `grupo ${num}`;
    }

    // Filtrar registros según grupo o difusión
    let datos = registros.filter(p => {
      const grupoActual = (p.grupo || '').toLowerCase();

      if (id === 'tablaTodas') return true;
      else if (id === 'tablaSoloReuniones') return grupoActual === 'solo reuniones';
      else if (id === 'tablaNoDiscipulado') return grupoActual === 'no quiere participar en un discipulado';
      else if (id === 'tablaDifusionTodas') return grupoActual.startsWith('difusión');
      else if (id.startsWith('tablaDifusionGrupo')) {
        const num = id.replace('tablaDifusionGrupo','').trim();
        return grupoActual === `difusión grupo ${num}`;
      } else if (id.startsWith('difusion')) {
        return grupoActual === id.replace('difusion_','difusión ');
      } else {
        const num = id.replace('tabla', '');
        return grupoActual === `grupo ${num}`;
      }
    });

    // Filtro por texto solo en "Todas las mujeres"
    if (id === 'tablaTodas' && filtroTexto) {
      const texto = filtroTexto.toLowerCase();
      datos = datos
        .filter(p => p.nombre.toLowerCase().includes(texto) || p.apellido.toLowerCase().includes(texto) || p.contacto.toLowerCase().includes(texto) || (p.grupo || '').toLowerCase().includes(texto))
        .map(p => {
          let score = 0;
          if (p.nombre.toLowerCase().startsWith(texto)) score += 10;
          else if (p.nombre.toLowerCase().includes(texto)) score += 5;
          if (p.apellido.toLowerCase().startsWith(texto)) score += 8;
          else if (p.apellido.toLowerCase().includes(texto)) score += 4;
          if ((p.grupo || '').toLowerCase().startsWith(texto)) score += 3;
          else if ((p.grupo || '').toLowerCase().includes(texto)) score += 1;
          if (p.contacto.toLowerCase().startsWith(texto)) score += 2;
          return { ...p, score };
        })
        .sort((a,b) => b.score - a.score);
    }

    // Ordenamiento
    if (orden === 'az') datos.sort((a,b) => a.nombre.localeCompare(b.nombre));
    else if (orden === 'za') datos.sort((a,b) => b.nombre.localeCompare(a.nombre));
    else if (orden === 'ultimas') datos.sort((a,b) => b.fechaRegistro - a.fechaRegistro);
    else if (orden === 'primeras') datos.sort((a,b) => a.fechaRegistro - b.fechaRegistro);

    // Render filas
    tbody.innerHTML = '';
    datos.forEach(data => {
      const fila = document.createElement('tr');
      if (esCumpleanos(data.cumple)) fila.classList.add('cumpleanos');

      fila.innerHTML = `
        <td class="foto-cell">
          <div class="foto-wrapper" style="position:relative;">
            <img src="${data.foto}" alt="foto" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">
            <span class="edit-icon edit-foto" title="Editar foto">✏️</span>
            <input type="file" accept="image/*" style="display:none;" class="input-foto" />
          </div>
        </td>
        <td>${data.nombre}</td>
        <td>${data.apellido}</td>
        <td>${formatearFecha(data.cumple)}</td>
        <td>${data.edad}</td>
        <td>${data.estado}</td>
        <td>${data.hijos}</td>
        <td class="contacto-cell">${data.contacto}<span class="edit-icon edit-contacto">✏️</span></td>
        <td class="direccion-cell">${data.direccion || ''}<span class="edit-icon edit-direccion">✏️</span></td>
        <td class="grupo-cell">${data.grupo || 'Sin asignar'}<span class="edit-icon grupo-edit">✏️</span></td>
        ${id !== 'tablaTodas' ? `<td><button class="btn-eliminar">🗑️</button></td>` : '<td></td>'}
      `;
      tbody.appendChild(fila);
    });

    agregarListenersEdicion();
  });
}



function toggleTabla(idTabla) {
  // Buscar la tabla por ID
  const tabla = document.getElementById(idTabla);
  if (!tabla) {
    console.warn(`La tabla con id "${idTabla}" no se encontró.`);
    return;
  }

  // Determinar si la tabla ya está visible
  const estaVisible = tabla.style.display === 'table';

  // Ocultar todas las tablas de grupos y difusiones
  document.querySelectorAll('.contenedor-tabla').forEach(contenedor => {
    contenedor.style.display = 'none';
  });

  // Si la tabla no estaba visible, mostrarla
  if (!estaVisible) {
    tabla.style.display = 'table';
    console.log(`Se está mostrando la tabla: "${idTabla}"`);

    // Manejar relación grupo ↔ difusión
    const difusionMatch = idTabla.match(/^difusion_(.+)$/);
    const grupoMatch = idTabla.match(/^tabla(\d+|SoloReu|NoDiscipulado)$/i);

    if (difusionMatch) {
      // Si es tabla de difusión, ocultar la tabla del grupo correspondiente
      const grupoRelacionado = difusionMatch[1];
      const idGrupo = grupoRelacionado === 'soloreu' ? 'tablaSoloReu' :
                      grupoRelacionado === 'nodiscipulado' ? 'tablaNoDiscipulado' :
                      `tabla${grupoRelacionado}`;
      const tablaGrupo = document.getElementById(idGrupo);
      if (tablaGrupo) {
        tablaGrupo.style.display = 'none';
        console.log(`Ocultando la tabla del grupo relacionado: "${idGrupo}"`);
      }
    } else if (grupoMatch) {
      // Si es tabla de grupo, ocultar su tabla de difusión correspondiente
      const grupoNombre = grupoMatch[1].toLowerCase();
      const idDifusion = grupoNombre === 'soloreu' ? 'difusion_soloreu' :
                         grupoNombre === 'nodiscipulado' ? 'difusion_nodiscipulado' :
                         `difusion_${grupoNombre}`;
      const tablaDifusion = document.getElementById(idDifusion);
      if (tablaDifusion) {
        tablaDifusion.style.display = 'none';
        console.log(`Ocultando la tabla de difusión relacionada: "${idDifusion}"`);
      }
    }
  } else {
    // Si estaba visible, ocultarla
    tabla.style.display = 'none';
    console.log(`Se está ocultando la tabla: "${idTabla}"`);
  }
}






// Función para validar si es cumpleaños hoy
function esCumpleanos(fechaStr) {
  if (!fechaStr) return false;
  const hoy = new Date();
  const fecha = new Date(fechaStr);
  return fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth();
}

// -------------------------
// EDICIÓN CON MODAL Y FOTO

let registroEditando = null;
let tipoEdicion = null;

const modal = document.createElement('div');
modal.id = 'modal-editar';
modal.style.display = 'none';
modal.innerHTML = `
  <div class="modal-content">
    <h3 id="modal-titulo"></h3>
    <input type="text" id="modal-input" />
    <select id="modal-select" style="display:none;">
      <option value="Solo reuniones">Solo reuniones</option>
      <option value="No quiere participar en un discipulado">No quiere participar en un discipulado</option>
      <option value="Difusión">Difusión</option>
      ${Array.from({length: 15}, (_, i) => `<option value="Grupo ${i+1}">Grupo ${i+1}</option>`).join('')}
    </select>

    <div class="modal-buttons">
      <button id="modal-guardar">Guardar</button>
      <button id="modal-cancelar">Cancelar</button>
    </div>
  </div>
`;


document.body.appendChild(modal);

const modalTitulo = modal.querySelector('#modal-titulo');
const modalInput = modal.querySelector('#modal-input');
const modalSelect = modal.querySelector('#modal-select');
const modalGuardar = modal.querySelector('#modal-guardar');
const modalCancelar = modal.querySelector('#modal-cancelar');

modalGuardar.onclick = () => {
  if (!registroEditando) return;

  if (tipoEdicion === 'contacto') {
    registroEditando.contacto = modalInput.value.trim();
  } else if (tipoEdicion === 'direccion') {
    registroEditando.direccion = modalInput.value.trim();
  } else if (tipoEdicion === 'grupo') {
    let seleccion = modalSelect.value;

    // Verificar si es difusión
    const esDifusion = seleccion.toLowerCase().startsWith('difusion');

    if (esDifusion) {
      // Guardar en difusión correspondiente
      registroEditando.grupo = seleccion.toLowerCase(); // ej: "difusion_grupo 1" o "difusion_soloreu"
      console.log(`Asignado a difusión: ${registroEditando.grupo}`);
    } else {
      // Guardar en grupo regular
      registroEditando.grupo = seleccion;
      console.log(`Asignado a grupo: ${registroEditando.grupo}`);
    }
  }

  modal.style.display = 'none';
  registroEditando = null;
  tipoEdicion = null;
  renderTablas();
};


modalCancelar.onclick = () => {
  modal.style.display = 'none';
  registroEditando = null;
  tipoEdicion = null;
};

function abrirModalEdicion(registro, tipo) {
  registroEditando = registro;
  tipoEdicion = tipo;

  modalInput.style.display = 'block';
  modalSelect.style.display = 'none';

  if (tipo === 'contacto') {
      modalTitulo.textContent = 'Editar número de contacto';
      modalInput.value = registro.contacto;
  } else if (tipo === 'direccion') {
      modalTitulo.textContent = 'Editar dirección';
      modalInput.value = registro.direccion || '';
  } else if (tipo === 'grupo') {
      modalTitulo.textContent = 'Editar grupo asignado';
      modalInput.style.display = 'none';
      modalSelect.style.display = 'block';

      // Limpiar opciones existentes
      modalSelect.innerHTML = '';

      // Opciones generales de grupos
      const gruposValidos = [
          'Solo reuniones',
          'No quiere participar en un discipulado',
          ...Array.from({length: 15}, (_, i) => `Grupo ${i+1}`)
      ];

      gruposValidos.forEach(g => {
          const option = document.createElement('option');
          option.value = g;
          option.textContent = g;
          modalSelect.appendChild(option);
      });

      // Opción de difusión específica del grupo actual
      const grupoActual = registro.grupo || 'Sin asignar';
      let opcionDifusion = '';
      if (grupoActual === 'Solo reuniones') opcionDifusion = 'Difusión Solo Reuniones';
      else if (grupoActual === 'No quiere participar en un discipulado') opcionDifusion = 'Difusión No Discipulado';
      else if (grupoActual.startsWith('Grupo')) opcionDifusion = `Difusión ${grupoActual}`;

      if (opcionDifusion) {
          const optionDif = document.createElement('option');
          optionDif.value = opcionDifusion;
          optionDif.textContent = opcionDifusion;
          modalSelect.appendChild(optionDif);
      }

      modalSelect.value = grupoActual;
  }

  modal.style.display = 'flex';
}


// Agregar listeners para edición (contacto, dirección, grupo, foto)
function agregarListenersEdicion() {
  // Evitar agregar listeners duplicados quitándolos primero
  document.querySelectorAll('.edit-contacto').forEach(el => {
    el.replaceWith(el.cloneNode(true));
  });
  document.querySelectorAll('.edit-direccion').forEach(el => {
    el.replaceWith(el.cloneNode(true));
  });
  document.querySelectorAll('.grupo-edit').forEach(el => {
    el.replaceWith(el.cloneNode(true));
  });
  document.querySelectorAll('.edit-foto').forEach(el => {
    el.replaceWith(el.cloneNode(true));
  });

  // Ahora agregar los listeners correctamente

  document.querySelectorAll('.edit-contacto').forEach(el => {
    el.onclick = e => {
      e.stopPropagation();
      const fila = el.closest('tr');
      const nombre = fila.children[1].textContent;
      const apellido = fila.children[2].textContent;
      const registro = registros.find(r => r.nombre === nombre && r.apellido === apellido);
      if (registro) abrirModalEdicion(registro, 'contacto');
    };
  });

  document.querySelectorAll('.edit-direccion').forEach(el => {
    el.onclick = e => {
      e.stopPropagation();
      const fila = el.closest('tr');
      const nombre = fila.children[1].textContent;
      const apellido = fila.children[2].textContent;
      const registro = registros.find(r => r.nombre === nombre && r.apellido === apellido);
      if (registro) abrirModalEdicion(registro, 'direccion');
    };
  });

  document.querySelectorAll('.grupo-edit').forEach(el => {
    el.onclick = e => {
      e.stopPropagation();
      const fila = el.closest('tr');
      const nombre = fila.children[1].textContent;
      const apellido = fila.children[2].textContent;
      const registro = registros.find(r => r.nombre === nombre && r.apellido === apellido);
      if (registro) abrirModalEdicion(registro, 'grupo');
    };
  });

  // Editar foto
  document.querySelectorAll('.foto-wrapper').forEach(wrapper => {
    const editIcon = wrapper.querySelector('.edit-foto');
    const inputFile = wrapper.querySelector('.input-foto');

    // Eliminar listeners previos para evitar duplicados
    editIcon.replaceWith(editIcon.cloneNode(true));
    wrapper.querySelector('.edit-foto').onclick = (e) => {
      e.stopPropagation();
      inputFile.click();
    };

    inputFile.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const img = wrapper.querySelector('img');
        img.src = evt.target.result;

        // Actualizar en registros el nuevo src
        const fila = wrapper.closest('tr');
        const nombre = fila.children[1].textContent;
        const apellido = fila.children[2].textContent;
        const registro = registros.find(r => r.nombre === nombre && r.apellido === apellido);
        if (registro) {
          registro.foto = evt.target.result;
        }
      };
      reader.readAsDataURL(file);
    };
  });

  // Botón eliminar de grupo: en realidad quita a la persona del grupo asignándole 'Sin asignar'
document.querySelectorAll('.btn-eliminar').forEach(btn => {
  btn.onclick = e => {
    e.stopPropagation();
    const fila = btn.closest('tr');
    const nombre = fila.children[1].textContent;
    const apellido = fila.children[2].textContent;
    const grupoCell = fila.querySelector('.grupo-cell');
    let grupo = '';
    for (const node of grupoCell.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        grupo += node.textContent;
      }
    }
    grupo = grupo.trim();

    // Solo procede si no es tabla "Todas las mujeres"
    if (grupo === "Todas las mujeres") {
      alert("No se puede eliminar desde la tabla 'Todas las mujeres'");
      return;
    }

    // Cambiar grupo a 'Sin asignar' para quitarla del grupo actual sin borrar el registro
    const registro = registros.find(r => r.nombre === nombre && r.apellido === apellido && r.grupo === grupo);
    if (registro) {
      registro.grupo = 'Sin asignar';
      renderTablas();
    }
  };
});


}

// Función para eliminar un registro de un grupo específico
function eliminarDeGrupo(nombre, apellido, grupo) {
  const idx = registros.findIndex(r => r.nombre === nombre && r.apellido === apellido && r.grupo === grupo);
  if (idx !== -1) {
    registros.splice(idx, 1);
    renderTablas();
  }
}

// Generar PDF (igual que antes)
function generarPDF(tablaId, nombreGrupo) {
  const tabla = document.getElementById(tablaId);
  const filas = [...tabla.querySelectorAll('tbody tr')];
  if (!filas.length) return alert('No hay datos para exportar');

  const doc = new window.jspdf.jsPDF();
  const rosa = [255, 105, 180]; // Color rosa para el diseño
  const columnas = [
      { header: "Nombre", dataKey: "nombre" },
      { header: "Apellido", dataKey: "apellido" },
      { header: "Cumpleaños", dataKey: "cumple" },
      { header: "Edad", dataKey: "edad" },
      { header: "Estado Civil", dataKey: "estado" },
      { header: "Hijos", dataKey: "hijos" },
      { header: "Contacto", dataKey: "contacto" },
      { header: "Dirección", dataKey: "direccion" }
  ];

  const datos = filas.map(fila => {
      const celdas = fila.querySelectorAll('td');
      return {
          nombre: celdas[1].textContent,
          apellido: celdas[2].textContent,
          cumple: celdas[3].textContent,
          edad: celdas[4].textContent,
          estado: celdas[5].textContent,
          hijos: celdas[6].textContent,
          contacto: celdas[7].textContent,
          direccion: celdas[8].textContent
      };
  });

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...rosa);
  doc.setFontSize(18);
  doc.text(nombreGrupo, 14, 16);

  doc.autoTable({
      startY: 20,
      head: [columnas.map(c => c.header)],
      body: datos.map(d => columnas.map(c => d[c.dataKey])),
      styles: {
          fontSize: 10,
          cellPadding: 2,
          overflow: 'linebreak',
          textColor: 20,
      },
      headStyles: {
          fillColor: rosa,
          textColor: 255,
          fontStyle: 'bold',
      },
      columnStyles: {
          6: { cellWidth: 35 },
          7: { cellWidth: 40 }
      },
      margin: { left: 14, right: 14 }
  });

  const yFinal = doc.lastAutoTable.finalY + 10;
  const conteoTexto = `Total: ${filas.length} mujeres`;
  const rectWidth = doc.getTextWidth(conteoTexto) + 14;
  const rectHeight = 12;
  doc.setFillColor(...rosa);
  doc.roundedRect(14, yFinal, rectWidth, rectHeight, 3, 3, 'F');
  doc.setTextColor(255);
  doc.setFontSize(12);
  doc.text(conteoTexto, 21, yFinal + 9);

  doc.save(`${nombreGrupo}.pdf`);
}

// Generar PDF agrupado por grupos
function generarPDFPorGrupos() {
  const doc = new window.jspdf.jsPDF();
  const rosa = [255, 105, 180];

  const grupos = [
    "Solo reuniones",
    "No quiere participar en un discipulado",
    ...Array.from({ length: 15 }, (_, i) => `Grupo ${i + 1}`)
  ];

  let total = 0;

  grupos.forEach((grupo, index) => {
    const datosGrupo = registros.filter(r => r.grupo === grupo);
    if (datosGrupo.length === 0) return;

    if (index > 0) doc.addPage();

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rosa);
    doc.setFontSize(16);
    doc.text(grupo, 14, 16);

    doc.autoTable({
      startY: 20,
      head: [[
          "Nombre", "Apellido", "Cumpleaños", "Edad",
          "Estado Civil", "Hijos", "Contacto", "Dirección"
      ]],
      body: datosGrupo.map(p => [
          p.nombre,
          p.apellido,
          formatearFecha(p.cumple),
          p.edad,
          p.estado,
          p.hijos,
          p.contacto,
          p.direccion || ''
      ]),
      styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: 20,
      },
      headStyles: {
          fillColor: rosa,
          textColor: 255,
          fontStyle: 'bold',
      },
      columnStyles: {
          6: { cellWidth: 35 },
          7: { cellWidth: 40 }
      },
      margin: { left: 14, right: 14 }
    });

    const yFinal = doc.lastAutoTable.finalY + 10;
    const conteoTexto = `Total: ${datosGrupo.length} mujeres`;
    const rectWidth = doc.getTextWidth(conteoTexto) + 14;

    doc.setFillColor(...rosa);
    doc.roundedRect(14, yFinal, rectWidth, 12, 3, 3, 'F');
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.text(conteoTexto, 21, yFinal + 9);

    total += datosGrupo.length;
  });

  doc.save(`Listado_por_Grupos.pdf`);
}

// Función para formatear fecha tipo "dd/mm/yyyy"
function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const d = new Date(fechaStr);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = (d.getMonth() + 1).toString().padStart(2, '0');
  const anio = d.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Cerrar menú PDF si se hace clic fuera
document.addEventListener('click', (e) => {
  document.querySelectorAll('.pdf-btn + div').forEach(menu => {
      if (!menu.contains(e.target) && !menu.previousSibling.contains(e.target)) {
          menu.style.display = 'none';
      }
  });
});





