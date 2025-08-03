// mujeres.js completo con edición, borrado, cumpleaños y actualización de edad

const cumpleInput = document.getElementById('cumple');
const edadInput = document.getElementById('edad');

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

const fotoInput = document.getElementById('foto');
const previewImg = document.getElementById('preview');

fotoInput.addEventListener('change', () => {
    const file = fotoInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => previewImg.src = e.target.result;
        reader.readAsDataURL(file);
    }
});

const form = document.getElementById('formulario');
const registros = [];

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = {
        foto: previewImg.src,
        nombre: document.getElementById('nombre').value.trim(),
        apellido: document.getElementById('apellido').value.trim(),
        cumple: document.getElementById('cumple').value,
        edad: document.getElementById('edad').value,
        contacto: document.getElementById('contacto').value.trim(),
        estado: document.getElementById('estado').value,
        hijos: document.getElementById('hijos').value,
        grupo: document.getElementById('grupo').value,
        fechaRegistro: new Date()
    };

    registros.push(data);
    renderTablas();
    form.reset();
    previewImg.src = '';
    edadInput.value = '';
});

function esCumpleHoy(fechaStr) {
    if (!fechaStr) return false;
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    return (fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth());
}

function mostrarAlertasCumple() {
    registros.forEach(data => {
        if (esCumpleHoy(data.cumple)) {
            alert(`🎉 ¡Hoy es el cumpleaños de ${data.nombre} ${data.apellido}!`);
        }
    });
}

function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
}

function agregarFiltros(tablaId) {
    const tabla = document.getElementById(tablaId);
    const container = tabla.parentElement;

    if (!container.querySelector('.filtro')) {
        const filtro = document.createElement('select');
        filtro.className = 'filtro';
        filtro.innerHTML = `
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="ultimas">Últimas registradas</option>
            <option value="primeras">Primeras registradas</option>
        `;
        filtro.addEventListener('change', () => renderTablas(filtro.value));
        container.insertBefore(filtro, tabla);
    }
}

function renderTablas(orden = 'az') {
    const tablas = ['tablaTodas', 'tablaSoloReuniones', 'tablaNoDiscipulado'];
    for (let i = 1; i <= 15; i++) tablas.push(`tabla${i}`);

    tablas.forEach(id => {
        const tabla = document.getElementById(id);
        if (!tabla || tabla.style.display !== 'table') return;

        const tbody = tabla.querySelector('tbody');
        tbody.innerHTML = '';

        let grupoFiltro = null;
        if (id !== 'tablaTodas') {
            if (id === 'tablaSoloReuniones') grupoFiltro = "Solo reuniones";
            else if (id === 'tablaNoDiscipulado') grupoFiltro = "No quiere participar en un discipulado";
            else {
                const gNum = id.replace('tabla', '');
                if (!isNaN(gNum)) grupoFiltro = gNum;
            }
        }

        let datos = registros.filter(p => {
            if (grupoFiltro === null) return true;
            return p.grupo === grupoFiltro;
        });

        if (orden === 'az') datos.sort((a, b) => a.nombre.localeCompare(b.nombre));
        else if (orden === 'za') datos.sort((a, b) => b.nombre.localeCompare(a.nombre));
        else if (orden === 'ultimas') datos.sort((a, b) => b.fechaRegistro - a.fechaRegistro);
        else if (orden === 'primeras') datos.sort((a, b) => a.fechaRegistro - b.fechaRegistro);

        datos.forEach((data) => {
            if (data.cumple) {
                const cumpleDate = new Date(data.cumple);
                const hoy = new Date();
                let edadActualizada = hoy.getFullYear() - cumpleDate.getFullYear();
                if (
                    hoy.getMonth() < cumpleDate.getMonth() ||
                    (hoy.getMonth() === cumpleDate.getMonth() && hoy.getDate() < cumpleDate.getDate())
                ) {
                    edadActualizada--;
                }
                if (parseInt(data.edad) !== edadActualizada) {
                    data.edad = edadActualizada;
                }
            }

            const esCumple = esCumpleHoy(data.cumple);
            const fila = document.createElement('tr');
            if (esCumple) fila.classList.add('cumpleanos');

            fila.innerHTML = `
                <td class="foto-cell">
                    <img src="${data.foto}" alt="foto">
                    <span class="edit-icon" title="Editar foto" onclick="editarFoto(${registros.indexOf(data)})">&#9998;</span>
                </td>
                <td>${data.nombre}</td>
                <td>${data.apellido}</td>
                <td>${formatearFecha(data.cumple)}</td>
                <td>${data.edad}</td>
                <td>${data.estado}</td>
                <td>${data.hijos}</td>
                <td class="contacto-cell">
                    <span class="contacto-text">${data.contacto}</span>
                    <span class="edit-icon" title="Editar contacto" onclick="editarContacto(${registros.indexOf(data)})">&#9998;</span>
                </td>
                <td class="grupo-cell">
                    <span class="grupo-text">${data.grupo || 'Sin asignar'}</span>
                    <span class="edit-icon" title="Editar grupo" onclick="editarGrupo(${registros.indexOf(data)})">&#9998;</span>
                </td>
                <td>
                    ${id !== 'tablaTodas' ? `<button onclick="borrarRegistro(${registros.indexOf(data)})" style="background-color:#e74c3c;">Borrar</button>` : ''}
                </td>
            `;
            tbody.appendChild(fila);
        });
    });

    mostrarAlertasCumple();
}

function toggleTable(id) {
    const table = document.getElementById(id);
    const container = table.parentElement;
    let filtro = container.querySelector('.filtro');

    const mostrar = table.style.display !== 'table';

    if (mostrar) {
        table.style.display = 'table';
        if (!filtro) {
            agregarFiltros(id);
            filtro = container.querySelector('.filtro');
            filtro.value = 'az';
            filtro.dispatchEvent(new Event('change'));
        }
    } else {
        table.style.display = 'none';
        if (filtro) filtro.remove();
    }
}

function borrarRegistro(index) {
    if (index >= 0 && index < registros.length) {
        registros[index].grupo = ""; // Solo se borra del grupo
        renderTablas();
    }
}

function editarContacto(index) {
    const nuevoContacto = prompt('Ingrese nuevo número de contacto:');
    if (nuevoContacto !== null && nuevoContacto.trim() !== '') {
        registros[index].contacto = nuevoContacto.trim();
        renderTablas();
    }
}

function editarFoto(index) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = event => {
                registros[index].foto = event.target.result;
                renderTablas();
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function editarGrupo(index) {
    const tbodyList = document.querySelectorAll('tbody');
    let fila, grupoCell;

    // Buscamos la fila que corresponde al registro en alguna tabla visible
    for (const tbody of tbodyList) {
        fila = tbody.children[index];
        if (fila) {
            grupoCell = fila.querySelector('.grupo-cell');
            if (grupoCell) break;
        }
    }
    if (!grupoCell) return;

    const opciones = [
        "Solo reuniones",
        "No quiere participar en un discipulado",
        ...Array.from({ length: 15 }, (_, i) => `${i + 1}`)
    ];

    const currentGroup = registros[index].grupo || '';

    // Limpiar contenido y crear select
    grupoCell.innerHTML = '';

    const select = document.createElement('select');
    select.style.width = '100%';
    select.style.padding = '0.3rem';
    select.style.borderRadius = '5px';
    select.style.border = '1px solid #ccc';

    opciones.forEach(op => {
        const option = document.createElement('option');
        option.value = op;
        option.textContent = op;
        if (op === currentGroup) option.selected = true;
        select.appendChild(option);
    });

    grupoCell.appendChild(select);

    // Crear botones confirmar y cancelar
    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = 'OK';
    btnConfirm.style.marginLeft = '5px';
    btnConfirm.type = 'button';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'Cancelar';
    btnCancel.style.marginLeft = '5px';
    btnCancel.type = 'button';

    grupoCell.appendChild(btnConfirm);
    grupoCell.appendChild(btnCancel);

    btnConfirm.onclick = () => {
        registros[index].grupo = select.value;
        renderTablas();
    };

    btnCancel.onclick = () => {
        renderTablas();
    };
}