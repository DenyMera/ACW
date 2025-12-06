/**
 * Este script controla la página 'perfil-paciente.html'.
 * Se ejecuta cuando el HTML está cargado. Sus tareas son:
 * 1. Leer la CI (ID) del paciente desde la URL.
 * 2. Leer el 'rol' del usuario actual (Doctor o Admin) desde la URL.
 * 3. Adaptar la interfaz (ocultar botones, cambiar sidebar) si es el Admin.
 * 4. Configurar los botones de acción (Agregar Encuentro, Descargar PDF, Volver).
 * 5. Cargar y mostrar los datos personales del paciente.
 * 6. Cargar y mostrar la tabla del historial de encuentros del paciente.
 * 7. Permitir la descarga del historial en PDF.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Mensaje en consola (F12) para saber que el script empezó.
    console.log('DOM cargado. Iniciando perfil.js...');

    // --- BLOQUE 1: LEER PARÁMETROS DE LA URL (Paciente y Rol) ---

    // 1.1. Creamos un objeto para leer los parámetros de la URL actual.
    // Ej: Si la URL es "...perfil-paciente.html?id=123&role=admin"
    const params = new URLSearchParams(window.location.search);
    
    // 1.2. Extraemos el valor del parámetro 'id' (la CI del paciente).
    const pacienteId = params.get('id');
    // 1.3. Extraemos el valor del parámetro 'role'. Será "admin" si el admin
    // llegó aquí desde su panel de búsqueda, o 'null' si es un doctor.
    const role = params.get('role'); 

    // 1.4. Verificación de seguridad: ¿Tenemos la CI del paciente?
    // Si 'pacienteId' es nulo (no vino en la URL), es un error grave.
    if (!pacienteId) {
        console.error('¡No se encontró pacienteId en la URL!');
        alert('Error: No se especificó un paciente. Redirigiendo...');
        // Redirigimos al usuario a la página principal del doctor por defecto.
        window.location.href = 'doctor.html';
        return; // Detenemos el script.
    }
    
    // Imprimimos en consola los datos que leímos (para depuración).
    console.log(`Cargando perfil para pacienteId: ${pacienteId}`);
    console.log(`Rol de usuario: ${role}`); // Mostrará 'admin' o 'null'

    
    // --- BLOQUE 2: CONFIGURAR BOTONES Y SIDEBAR SEGÚN EL ROL ---

    // 2.1. Seleccionamos los botones de acción principales.
    const btnAgregar = document.getElementById('btn-agregar-encuentro');
    const btnVolver = document.getElementById('btn-volver');
    
    // 2.2. Comprobamos si el rol es 'admin'.
    if (role === 'admin') {
        // --- MODO ADMINISTRADOR (Vista de solo lectura) ---
        console.log('Vista de Admin: Ocultando "Agregar Encuentro" y adaptando sidebar.');
        
        // 2.3. Ocultar el botón "Agregar Encuentro".
        // Si el botón existe...
        if (btnAgregar) {
            // Cambiamos su estilo CSS 'display' a 'none' para hacerlo invisible.
            btnAgregar.style.display = 'none'; 
        }
        
        // 2.4. Cambiar el destino del botón "Volver Atrás".
        // Si el botón existe...
        if (btnVolver) {
            // Hacemos que apunte de vuelta al panel del admin ('admin.html').
            btnVolver.href = 'admin.html'; 
        }
        
        // 2.5. Llamamos a una función (definida abajo) que modifica
        // la barra lateral (sidebar) para que muestre "Administrador"
        // y los botones de navegación del admin.
        actualizarSidebarAdmin();
        
    } else {
        // --- MODO DOCTOR (Vista normal, con edición) ---
        console.log('Vista de Doctor: Configurando botones.');
        
        // 2.6. Configurar el botón "Agregar Encuentro".
        // Si el botón existe...
        if (btnAgregar) {
            // Le asignamos el 'href' para que lleve a la página del formulario,
            // pasando la CI del paciente actual en la URL.
            btnAgregar.href = `agregar-encuentro.html?id=${pacienteId}`;
        }
        
        // 2.7. Configurar el botón "Volver Atrás".
        // Si el botón existe...
        if (btnVolver) {
            // Hacemos que apunte de vuelta al panel del doctor ('doctor.html').
            btnVolver.href = 'doctor.html'; 
        }
        
        // (En modo Doctor, también necesitamos cargar su nombre en la sidebar)
        // Llamamos a la función que lee el nombre del doctor desde sessionStorage
        // y lo muestra en la cabecera de la sidebar.
        cargarInfoDoctor(); // (Función definida más abajo)
    }

    
    // --- BLOQUE 3: CONFIGURAR BOTÓN "DESCARGAR PDF" (Común a ambos roles) ---

    // 3.1. Seleccionamos el botón.
    const btnDescargar = document.getElementById('btn-descargar-pdf');
    // 3.2. Si existe...
    if (btnDescargar) {
        // 3.3. Le añadimos un escuchador para el evento 'click'.
        btnDescargar.addEventListener('click', function() {
            console.log('Clic en "Descargar PDF"');
            // Cuando se haga clic, llamamos a la función 'generarPDF'
            // (definida abajo), pasándole la CI del paciente actual.
            generarPDF(pacienteId);
        });
        console.log('Botón "Descargar PDF" configurado.');
    } else {
        // Si el botón no se encuentra, mostramos un error en consola.
        console.error('Error: No se encontró el botón con id "btn-descargar-pdf".');
    }

    
    // --- BLOQUE 4: CARGAR DATOS DEL PACIENTE EN LA PÁGINA ---

    // 4.1. Llamamos a la función que carga los datos personales.
    console.log('Llamando a cargarDatosPaciente...');
    cargarDatosPaciente(pacienteId); 
    
    // 4.2. Llamamos a la función que carga la tabla del historial.
    console.log('Llamando a cargarEncuentros...');
    cargarEncuentros(pacienteId);
    
    const btnJson = document.getElementById('btn-exportar-json');
    if (btnJson) {
        btnJson.addEventListener('click', function() {
            exportarDatosJSON(pacienteId);
        });
    }

    const btnXml = document.getElementById('btn-exportar-xml');
    if (btnXml) {
        btnXml.addEventListener('click', function() {
            exportarDatosXML(pacienteId);
        });
    }
}); // <-- Fin del 'DOMContentLoaded'


// --- BLOQUE 5: DEFINICIÓN DE FUNCIONES ---

/**
 * Función 'cargarDatosPaciente'
 * Busca al paciente por su ID (CI) en localStorage y rellena
 * la sección "Datos Personales" del HTML con su información.
 * @param {string} id - La CI del paciente.
 */
function cargarDatosPaciente(id) {
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    const paciente = pacientes.find(p => p.ci === id);
    
    if (paciente) {
        // Rellenar los <span> del HTML.
        document.getElementById('p-nombre').textContent = paciente.nombre;
        document.getElementById('p-ci').textContent = paciente.ci;
        document.getElementById('p-edad').textContent = paciente.edad;
        document.getElementById('p-telefono').textContent = paciente.telefono || 'N/A'; // Valor por defecto si está vacío
        document.getElementById('p-email').textContent = paciente.email || 'N/A';
        document.getElementById('p-alergias').textContent = paciente.alergias || 'Ninguna'; // Valor por defecto
    } else {
        // Si no se encuentra el paciente (no debería pasar),
        // muestra un error en consola y en la propia sección.
        console.error('No se pudieron cargar los datos del paciente.');
        const infoSection = document.querySelector('.patient-info');
        if (infoSection) infoSection.innerHTML = '<h2>Error: Paciente no encontrado</h2>';
    }
}

/**
 * Función 'actualizarSidebarAdmin'
 * Modifica la barra lateral (sidebar) para que muestre el título
 * "Administrador" y los botones de navegación correspondientes al admin.
 * También añade la funcionalidad de búsqueda a ese nuevo botón.
 * SOLO se llama si el 'role' en la URL es 'admin'.
 */
function actualizarSidebarAdmin() {
    // 5.1. Cambiar el título de la sidebar.
    const sidebarHeader = document.querySelector('.sidebar-header h3'); // Selecciona el <h3> dentro de .sidebar-header
    if (sidebarHeader) {
        sidebarHeader.textContent = 'Administrador'; // Cambia el texto
    }
    
    // 5.2. Cambiar los botones de navegación.
    const sidebarNav = document.querySelector('.sidebar-nav'); // Selecciona el <nav>
    if (sidebarNav) {
        // Reemplazamos TODO el contenido HTML del <nav> con los botones del admin.
        sidebarNav.innerHTML = `
            <a href="#" id="btn-buscar-usuario-sidebar" class="nav-button">Buscar Usuario</a>
            <a href="agregar-usuario.html" class="nav-button">Agregar Usuario</a>
        `;
        
        // 5.3. Añadimos la lógica de búsqueda al NUEVO botón "Buscar Usuario".
        // Es necesario hacerlo aquí porque el botón acaba de ser creado.
        document.getElementById('btn-buscar-usuario-sidebar').addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir salto de página
            const ciBuscada = prompt("Ingrese el número de cédula (CI) del usuario:");
            if (!ciBuscada) return; // Salir si cancela
            
            // Cargar listas y buscar (misma lógica que en admin.js)
            const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
            const doctores = JSON.parse(localStorage.getItem('doctores_lista')) || [];
            const p = pacientes.find(p => p.ci === ciBuscada.trim());
            if (p) {
                // Si encuentra paciente, redirige al perfil del paciente (¡pero con role=admin!)
                // Esto es para que si busca desde aquí, la siguiente página siga en modo admin.
                window.location.href = `perfil-paciente.html?id=${p.ci}&role=admin`;
                return;
            }
            const d = doctores.find(d => d.ci === ciBuscada.trim());
            if (d) {
                // Si encuentra doctor, redirige a la vista del perfil del doctor.
                window.location.href = `perfil-doctor-admin.html?id=${d.ci}`;
                return;
            }
            // Si no encuentra nada.
            alert("No existe un usuario con esa cédula.");
        });
    }
}

/**
 * Función 'cargarInfoDoctor' (COPIADA de doctor.js)
 * Lee el nombre del doctor desde sessionStorage y lo muestra en la sidebar.
 * SOLO se llama si el 'role' en la URL NO es 'admin'.
 */
function cargarInfoDoctor() {
    const nombreDoctor = sessionStorage.getItem('doctorName');
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    
    // Redirige al login si no hay sesión Y NO estamos en modo admin.
    if (!nombreDoctor && role !== 'admin') {
        alert('Sesión no encontrada. Por favor, inicie sesión.');
        window.location.href = 'index.html';
        return;
    }
    
    // Muestra el nombre solo si NO estamos en modo admin.
    const nameElement = document.getElementById('doctor-name');
    if (nameElement && role !== 'admin') {
        nameElement.textContent = nombreDoctor; 
    }
}


/**
 * Función 'cargarEncuentros'
 * Carga el historial de encuentros del paciente desde localStorage
 * y lo muestra en la tabla HTML.
 * @param {string} id - La CI del paciente.
 */
function cargarEncuentros(id) {
    // (Esta función es idéntica a la que tenías, con comentarios internos)
    console.log(`Cargando encuentros para: ${id}`);
    const tbody = document.getElementById('historial-tbody');
    if (!tbody) {
        console.error('Error fatal: No se encontró "historial-tbody" en el HTML.');
        return;
    }
    tbody.innerHTML = ''; // Limpiar tabla
    const key = `paciente_${id}`; // Clave única para este paciente
    let encuentros;
    try {
        // Cargar y parsear
        encuentros = JSON.parse(localStorage.getItem(key)) || [];
        console.log(`Se encontraron ${encuentros.length} encuentros.`);
    } catch (e) {
        // Manejar error de parseo
        console.error('Error al parsear datos de localStorage:', e);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: red;">Error al leer el historial.</td></tr>';
        return;
    }
    // Si no hay encuentros
    if (encuentros.length === 0) {
        console.log('No hay encuentros. Mostrando mensaje.');
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No hay encuentros registrados.</td></tr>';
        return;
    }
    // Recorrer y crear filas
    encuentros.forEach(enc => {
        let pdfLinkHtml = 'Sin Documento';
        if (enc.pdfData) {
            // Crear enlace de descarga para el PDF
            pdfLinkHtml = `<a href="${enc.pdfData}" download="encuentro-${enc.fecha}.pdf" class="pdf-link">Descargar PDF</a>`;
        }
        const fila = document.createElement('tr');
        // Rellenar celdas (usando || 'N/A' para valores vacíos)
        fila.innerHTML = `
            <td>${enc.fecha || 'N/A'}</td>
            <td>${enc.motivo || 'N/A'}</td>
            <td>${enc.diagnostico || 'N/A'}</td>
            <td>${enc.tratamiento || 'N/A'}</td>
            <td>${enc.peso || 'N/A'}</td>
            <td>${enc.presion || 'N/A'}</td>
            <td>${enc.observaciones || 'N/A'}</td>
            <td>${pdfLinkHtml}</td>
        `;
        tbody.appendChild(fila); // Añadir fila a la tabla
    });
    console.log('Tabla de historial rellenada.');
}

/**
 * Función 'generarPDF'
 * Crea un PDF con el historial del paciente usando la librería jsPDF.
 * @param {string} pacienteId - La CI del paciente.
 */
function generarPDF(pacienteId) {
    console.log('Iniciando generación de PDF...');
    // Verificar si jsPDF está cargada
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error('Error: La librería jsPDF no se ha cargado.');
        alert('Error: La librería de generación de PDF no se cargó correctamente.');
        return;
    }
    // Cargar encuentros
    const key = `paciente_${pacienteId}`;
    const encuentros = JSON.parse(localStorage.getItem(key)) || [];
    // Si no hay encuentros, no hacer nada
    if (encuentros.length === 0) {
        console.log('No hay encuentros, mostrando alerta.');
        alert('No hay encuentros para descargar.');
        return;
    }
    try {
        // Crear documento PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        console.log('jsPDF inicializado.');
        let y = 15; // Posición vertical inicial
        // Título
        doc.setFontSize(18);
        doc.text(`Historial Clínico - Paciente ID: ${pacienteId}`, 10, y);
        y += 10;
        // Recorrer encuentros
        encuentros.forEach((enc, index) => {
            // Salto de página si es necesario
            if (y > 270) { 
                doc.addPage();
                y = 10;
            }
            // Datos del encuentro
            doc.setFontSize(14);
            doc.text(`Encuentro #${index + 1} - Fecha: ${enc.fecha || 'N/A'}`, 10, y); y += 8;
            doc.setFontSize(10);
            doc.text(`Motivo: ${enc.motivo || 'N/A'}`, 15, y); y += 6;
            doc.text(`Peso: ${enc.peso || 'N/A'} kg`, 15, y); y += 6;
            doc.text(`Presión: ${enc.presion || 'N/A'}`, 15, y); y += 6;
            // Manejar textos largos
            const maxWidth = 180; 
            let diag = doc.splitTextToSize(`Diagnóstico: ${enc.diagnostico || 'N/A'}`, maxWidth);
            doc.text(diag, 15, y); y += (diag.length * 5) + 3;
            let trat = doc.splitTextToSize(`Tratamiento: ${enc.tratamiento || 'N/A'}`, maxWidth);
            doc.text(trat, 15, y); y += (trat.length * 5) + 3;
            let obs = doc.splitTextToSize(`Observaciones: ${enc.observaciones || 'N/A'}`, maxWidth);
            doc.text(obs, 15, y); y += (obs.length * 5) + 3;
            // Línea separadora
            y += 2;
            doc.line(10, y, 200, y); 
            y += 7;
        });
        // Guardar el archivo PDF
        console.log('Guardando PDF...');
        doc.save(`historial-paciente-${pacienteId}.pdf`);
    } catch (e) {
        // Manejar error de creación
        console.error('Error durante la creación del PDF:', e);
        alert('Ocurrió un error inesperado al generar el PDF.');
    }
}

/**
 * Función para exportar datos completos en formato JSON
 */

function exportarDatosJSON(id) {
    // 1. Obtener datos
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    const paciente = pacientes.find(p => p.ci === id);
    const key = `paciente_${id}`;
    const encuentros = JSON.parse(localStorage.getItem(key)) || [];

    if (!paciente) {
        alert("No se encontraron datos del paciente para exportar.");
        return;
    }

    // Función auxiliar para limpiar texto (evitar que comillas o enters rompan el JSON)
    const limpiar = (texto) => {
        if (!texto) return "";
        return texto.toString()
            .replace(/\\/g, '\\\\')  // Escapar barras invertidas
            .replace(/"/g, '\\"')    // Escapar comillas dobles
            .replace(/\n/g, ' ');    // Cambiar saltos de línea por espacios
    };

    // 2. Construir String JSON manualmente
    let jsonString = '{\n';

    // --- Sección Info Paciente ---
    jsonString += '    "info_paciente": {\n';
    jsonString += `        "nombre": "${limpiar(paciente.nombre)}",\n`;
    jsonString += `        "ci": "${limpiar(paciente.ci)}",\n`;
    jsonString += `        "edad": ${paciente.edad},\n`; // Número, sin comillas
    jsonString += `        "telefono": "${limpiar(paciente.telefono || 'N/A')}",\n`;
    jsonString += `        "email": "${limpiar(paciente.email || 'N/A')}",\n`;
    jsonString += `        "alergias": "${limpiar(paciente.alergias || 'Ninguna')}"\n`; // Último elemento sin coma
    jsonString += '    },\n';

    // --- Sección Historial Médico ---
    jsonString += '    "historial_medico": [\n';
    
    // Recorremos los encuentros
    encuentros.forEach((enc, index) => {
        jsonString += '        {\n';
        jsonString += `            "id_encuentro": ${index + 1},\n`;
        jsonString += `            "fecha": "${limpiar(enc.fecha)}",\n`;
        jsonString += `            "motivo": "${limpiar(enc.motivo)}",\n`;
        jsonString += `            "peso_kg": "${limpiar(enc.peso)}",\n`;
        jsonString += `            "presion_arterial": "${limpiar(enc.presion)}",\n`;
        jsonString += `            "diagnostico": "${limpiar(enc.diagnostico)}",\n`;
        jsonString += `            "tratamiento": "${limpiar(enc.tratamiento)}",\n`;
        jsonString += `            "observaciones": "${limpiar(enc.observaciones)}",\n`;
        jsonString += `            "tiene_documento_adjunto": "${enc.pdfData ? 'Si' : 'No'}"\n`;
        
        // Cerramos la llave del objeto. Si NO es el último, agregamos coma.
        if (index < encuentros.length - 1) {
            jsonString += '        },\n';
        } else {
            jsonString += '        }\n';
        }
    });

    jsonString += '    ],\n';

    // --- Metadatos ---
    jsonString += '    "metadata": {\n';
    jsonString += `        "fecha_exportacion": "${new Date().toISOString()}",\n`;
    jsonString += `        "total_encuentros": ${encuentros.length}\n`;
    jsonString += '    }\n';

    jsonString += '}'; // Cierre final del JSON

    // 3. Crear Blob y descargar
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `paciente-${id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Función para exportar datos completos en formato XML
 */

function exportarDatosXML(id) {
    // 1. Obtener datos
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    const paciente = pacientes.find(p => p.ci === id);
    const key = `paciente_${id}`;
    const encuentros = JSON.parse(localStorage.getItem(key)) || [];

    if (!paciente) {
        alert("No se encontraron datos.");
        return;
    }

    // 2. Construir String XML manualmente
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlString += '<expediente_medico>\n';
    
    // --- Datos del Paciente ---
    xmlString += '  <datos_paciente>\n';
    xmlString += `    <nombre>${paciente.nombre}</nombre>\n`;
    xmlString += `    <ci>${paciente.ci}</ci>\n`;
    xmlString += `    <edad>${paciente.edad}</edad>\n`;
    xmlString += `    <telefono>${paciente.telefono || 'N/A'}</telefono>\n`;
    xmlString += `    <email>${paciente.email || 'N/A'}</email>\n`;
    xmlString += `    <alergias>${paciente.alergias || 'Ninguna'}</alergias>\n`;
    xmlString += '  </datos_paciente>\n';

    // --- Historial Completo de Encuentros ---
    xmlString += '  <historial_encuentros>\n';
    
    if(encuentros.length === 0) {
        xmlString += '    <nota>Sin encuentros registrados</nota>\n';
    } else {
        encuentros.forEach((enc, index) => {
            xmlString += `    <encuentro id="${index + 1}">\n`;
            // Agregamos TODOS los campos disponibles en el formulario de encuentro
            xmlString += `      <fecha>${enc.fecha || ''}</fecha>\n`;
            xmlString += `      <motivo>${enc.motivo || ''}</motivo>\n`;
            xmlString += `      <peso_kg>${enc.peso || ''}</peso_kg>\n`;
            xmlString += `      <presion_arterial>${enc.presion || ''}</presion_arterial>\n`;
            xmlString += `      <diagnostico>${enc.diagnostico || ''}</diagnostico>\n`;
            xmlString += `      <tratamiento>${enc.tratamiento || ''}</tratamiento>\n`;
            xmlString += `      <observaciones>${enc.observaciones || ''}</observaciones>\n`;
            
            // Indicamos si hay un archivo adjunto (no incluimos el Base64 para no romper el XML)
            xmlString += `      <documento_adjunto>${enc.pdfData ? 'Si (PDF disponible en sistema)' : 'No'}</documento_adjunto>\n`;
            xmlString += '    </encuentro>\n';
        });
    }
    xmlString += '  </historial_encuentros>\n';
    xmlString += '</expediente_medico>';

    // 3. Crear Blob y descargar
    const blob = new Blob([xmlString], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `paciente-${id}-completo.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}