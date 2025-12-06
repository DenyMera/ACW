/**
 * Este script controla la página 'paciente-vista.html'.
 * Se ejecuta cuando el HTML está cargado.
 * Sus tareas son:
 * 1. Obtener la CI (ID) del paciente que inició sesión desde la URL.
 * 2. Cargar y mostrar los datos personales del paciente.
 * 3. Cargar y mostrar el historial de encuentros del paciente.
 * 4. Permitir al paciente descargar su historial clínico en formato PDF.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Imprimimos en consola (F12) que el script ha comenzado.
    console.log('DOM cargado. Iniciando paciente-vista.js...');

    // --- BLOQUE 1: LEER PARÁMETROS DE LA URL ---

    // 1.1. Creamos un objeto para leer fácilmente los parámetros de la URL.
    const params = new URLSearchParams(window.location.search);
    // 1.2. Obtenemos el valor del parámetro 'id' (que es la CI del paciente).
    const pacienteId = params.get('id'); 

    // 1.3. Verificación de seguridad: ¿Existe el ID del paciente?
    // Si 'pacienteId' es nulo (no vino en la URL), mostramos un error
    // y redirigimos al usuario a la página de inicio de sesión.
    if (!pacienteId) {
        console.error('¡No se encontró pacienteId en la URL!');
        alert('Error: No se pudo cargar el perfil. Redirigiendo al inicio.');
        window.location.href = 'index.html';
        return; // Detiene la ejecución del script.
    }
    
    // --- BLOQUE 2: CONFIGURAR EL BOTÓN DE DESCARGAR PDF ---

    // 2.1. Seleccionamos el botón "Descargar Historial (PDF)".
    const btnDescargar = document.getElementById('btn-descargar-pdf');
    
    // 2.2. Si el botón existe...
    if (btnDescargar) {
        // 2.3. Añadimos un "escuchador" para el evento 'click'.
        btnDescargar.addEventListener('click', function() {
            // Cuando se haga clic, llamamos a la función 'generarPDF',
            // pasándole la CI del paciente actual.
            generarPDF(pacienteId);
        });
    }

    // --- BLOQUE 3: CARGAR Y MOSTRAR LOS DATOS DEL PACIENTE ---

    // 3.1. Llamamos a la función (definida abajo) que carga los datos
    // personales del paciente y los pone en la sección correspondiente del HTML.
    cargarDatosPaciente(pacienteId); 
    
    // 3.2. Llamamos a la función (definida abajo) que carga el historial
    // de encuentros y lo muestra en la tabla del HTML.
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


// --- BLOQUE 4: DEFINICIÓN DE FUNCIONES ---

/**
 * Función 'cargarDatosPaciente'
 * Busca en la lista de pacientes (guardada en localStorage) al paciente
 * que coincida con el 'id' (CI) proporcionado y rellena la sección
 * "Mis Datos Personales" en el HTML con su información.
 * @param {string} id - La CI del paciente a cargar.
 */
function cargarDatosPaciente(id) {
    // 4.1. Cargamos la lista completa de pacientes.
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    // 4.2. Buscamos al paciente específico.
    const paciente = pacientes.find(p => p.ci === id);
    
    // 4.3. Si encontramos al paciente...
    if (paciente) {
        // Rellenamos los elementos <span> del HTML con los datos.
        // Usamos 'textContent' para insertar el texto de forma segura.
        // '|| 'N/A'' o '|| 'Ninguna'' se usan como valores por defecto
        // si el campo original estaba vacío.
        document.getElementById('p-nombre').textContent = paciente.nombre;
        document.getElementById('p-ci').textContent = paciente.ci;
        document.getElementById('p-edad').textContent = paciente.edad;
        document.getElementById('p-telefono').textContent = paciente.telefono || 'N/A';
        document.getElementById('p-email').textContent = paciente.email || 'N/A';
        document.getElementById('p-alergias').textContent = paciente.alergias || 'Ninguna';
    } else {
        // Si no encontramos al paciente (esto no debería pasar si el login funcionó),
        // mostramos un error en la consola.
        console.error('No se pudieron cargar los datos del paciente.');
    }
}

/**
 * Función 'cargarEncuentros'
 * Carga la lista de encuentros clínicos para el paciente especificado
 * (guardada en localStorage con una clave única como 'paciente_12345')
 * y crea las filas (<tr>) correspondientes en la tabla del historial.
 * @param {string} id - La CI del paciente cuyo historial cargar.
 */
function cargarEncuentros(id) {
    // 4.4. Seleccionamos el cuerpo (tbody) de la tabla del historial.
    const tbody = document.getElementById('historial-tbody');
    // Verificamos si la tabla existe (seguridad).
    if (!tbody) {
        console.error('Error fatal: No se encontró "historial-tbody".');
        return;
    }
    // 4.5. Limpiamos cualquier contenido anterior de la tabla.
    tbody.innerHTML = '';
    
    // 4.6. Creamos la clave única para buscar el historial de este paciente.
    const key = `paciente_${id}`;
    let encuentros; // Variable para guardar la lista de encuentros.
    
    // 4.7. Intentamos cargar y parsear los encuentros.
    // Usamos 'try...catch' porque 'JSON.parse' puede fallar si los datos
    // en localStorage están corruptos.
    try {
        encuentros = JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        // Si hay un error al leer, lo mostramos en consola y en la tabla.
        console.error('Error al parsear datos de localStorage:', e);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error al leer el historial.</td></tr>';
        return; // Detenemos la función.
    }
    
    // 4.8. Verificamos si no hay encuentros registrados.
    if (encuentros.length === 0) {
        // Si la lista está vacía, mostramos un mensaje en la tabla.
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay encuentros registrados.</td></tr>';
        return; // Detenemos la función.
    }
    
    // 4.9. Si hay encuentros, recorremos la lista uno por uno.
    encuentros.forEach(enc => {
        // 4.10. Preparamos el enlace para el PDF adjunto (si existe).
        let pdfLinkHtml = 'Sin Documento'; // Texto por defecto.
        // Si el encuentro tiene datos de PDF guardados...
        if (enc.pdfData) {
            // Creamos una etiqueta <a>.
            // 'href="${enc.pdfData}"' pone los datos Base64 del PDF como destino.
            // 'download="..."' le dice al navegador que descargue el archivo
            // con ese nombre en lugar de intentar mostrarlo.
            pdfLinkHtml = `<a href="${enc.pdfData}" download="encuentro-${enc.fecha}.pdf" class="pdf-link">Ver PDF</a>`;
        }
        
        // 4.11. Creamos una nueva fila <tr>.
        const fila = document.createElement('tr');
        
        // 4.12. Rellenamos la fila con las celdas <td>.
        // Mostramos los datos relevantes para el paciente.
        // Usamos '|| 'N/A'' para mostrar 'N/A' si algún campo está vacío.
        fila.innerHTML = `
            <td>${enc.fecha || 'N/A'}</td>
            <td>${enc.motivo || 'N/A'}</td>
            <td>${enc.diagnostico || 'N/A'}</td>
            <td>${enc.tratamiento || 'N/A'}</td>
            <td>${enc.peso || 'N/A'}</td>
            <td>${pdfLinkHtml}</td> 
        `;
        // 4.13. Añadimos la fila completa a la tabla.
        tbody.appendChild(fila);
    });
}

/**
 * Función 'generarPDF'
 * Utiliza la librería jsPDF para crear un documento PDF con el resumen
 * del historial clínico del paciente y lo ofrece para descargar.
 * @param {string} pacienteId - La CI del paciente.
 */
function generarPDF(pacienteId) {
    
    // 4.14. Verificación: ¿Se cargó correctamente la librería jsPDF?
    // 'window.jspdf' es como la librería se registra globalmente.
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error('Error: La librería jsPDF no se ha cargado.');
        alert('Error: La librería de generación de PDF no se cargó correctamente.');
        return; // Detiene la función.
    }
    
    // 4.15. Cargamos la lista de encuentros del paciente.
    const key = `paciente_${pacienteId}`;
    const encuentros = JSON.parse(localStorage.getItem(key)) || [];
    
    // 4.16. Si no hay encuentros, no generamos PDF.
    if (encuentros.length === 0) {
        alert('No hay encuentros para descargar.');
        return;
    }
    
    // 4.17. Usamos 'try...catch' por si ocurre algún error durante la creación del PDF.
    try {
        // 4.18. Creamos un nuevo documento PDF en blanco.
        const { jsPDF } = window.jspdf; // Obtenemos la clase jsPDF
        const doc = new jsPDF(); // Creamos la instancia del documento
        
        // 4.19. Definimos la posición vertical inicial (margen superior).
        let y = 15; 
        
        // 4.20. Añadimos el título al PDF.
        doc.setFontSize(18); // Tamaño de letra
        doc.text(`Mi Historial Clínico - Paciente ID: ${pacienteId}`, 10, y); // Texto, posición X, posición Y
        y += 10; // Movemos la posición 'y' hacia abajo para el siguiente texto.
        
        // 4.21. Recorremos cada encuentro para añadirlo al PDF.
        encuentros.forEach((enc, index) => {
            
            // 4.22. Verificamos si necesitamos una nueva página.
            // Si la posición 'y' actual está muy abajo (cerca del final de A4)...
            if (y > 270) { 
                doc.addPage(); // Añade una página nueva.
                y = 10; // Reinicia la posición 'y' al margen superior.
            }
            
            // 4.23. Escribimos los datos de cada encuentro.
            doc.setFontSize(14); // Título del encuentro
            doc.text(`Encuentro #${index + 1} - Fecha: ${enc.fecha || 'N/A'}`, 10, y); y += 8;
            
            doc.setFontSize(10); // Datos del encuentro
            doc.text(`Motivo: ${enc.motivo || 'N/A'}`, 15, y); y += 6;
            doc.text(`Peso: ${enc.peso || 'N/A'} kg`, 15, y); y += 6;
            // (La presión no estaba incluida en el código original, la añado)
            doc.text(`Presión: ${enc.presion || 'N/A'}`, 15, y); y += 6; 
            
            // 4.24. Manejo de textos largos (Diagnóstico, Tratamiento, Observaciones).
            const maxWidth = 180; // Ancho máximo permitido para el texto.
            // 'doc.splitTextToSize()' divide un texto largo en un array de líneas
            // que quepan en el ancho especificado.
            let diag = doc.splitTextToSize(`Diagnóstico: ${enc.diagnostico || 'N/A'}`, maxWidth);
            doc.text(diag, 15, y); // Escribe el array de líneas.
            y += (diag.length * 5) + 3; // Ajusta 'y' según cuántas líneas se usaron.
            
            let trat = doc.splitTextToSize(`Tratamiento: ${enc.tratamiento || 'N/A'}`, maxWidth);
            doc.text(trat, 15, y); y += (trat.length * 5) + 3;
            
            let obs = doc.splitTextToSize(`Observaciones: ${enc.observaciones || 'N/A'}`, maxWidth);
            doc.text(obs, 15, y); y += (obs.length * 5) + 3;
            
            // 4.25. Añadimos una línea separadora entre encuentros.
            y += 2; 
            doc.line(10, y, 200, y); // Dibuja línea (x1, y1, x2, y2)
            y += 7; // Espacio antes del siguiente encuentro.
        }); // Fin del bucle forEach
        
        // 4.26. Guardamos el PDF.
        // 'doc.save()' le dice al navegador que inicie la descarga del archivo
        // con el nombre especificado.
        doc.save(`mi-historial-${pacienteId}.pdf`);
        
    } catch (e) {
        // Si ocurre un error durante la creación, lo mostramos.
        console.error('Error durante la creación del PDF:', e);
        alert('Ocurrió un error inesperado al generar el PDF.');
    }
}

/**
 * Función para exportar datos completos en formato XML
 * Incluye toda la información médica disponible.
 */
function exportarDatosXML(id) {
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    const paciente = pacientes.find(p => p.ci === id);
    const key = `paciente_${id}`;
    const encuentros = JSON.parse(localStorage.getItem(key)) || [];

    if (!paciente) {
        alert("No se encontraron datos.");
        return;
    }

    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlString += '<expediente_medico>\n';
    
    // Datos del Paciente
    xmlString += '  <datos_paciente>\n';
    xmlString += `    <nombre>${paciente.nombre}</nombre>\n`;
    xmlString += `    <ci>${paciente.ci}</ci>\n`;
    xmlString += `    <edad>${paciente.edad}</edad>\n`;
    xmlString += `    <telefono>${paciente.telefono || 'N/A'}</telefono>\n`;
    xmlString += `    <email>${paciente.email || 'N/A'}</email>\n`;
    xmlString += `    <alergias>${paciente.alergias || 'Ninguna'}</alergias>\n`;
    xmlString += '  </datos_paciente>\n';

    // Historial Médico Completo
    xmlString += '  <historial_encuentros>\n';
    if(encuentros.length === 0) {
        xmlString += '    <nota>Sin encuentros registrados</nota>\n';
    } else {
        encuentros.forEach((enc, index) => {
            xmlString += `    <encuentro id="${index + 1}">\n`;
            xmlString += `      <fecha>${enc.fecha || ''}</fecha>\n`;
            xmlString += `      <motivo>${enc.motivo || ''}</motivo>\n`;
            xmlString += `      <peso_kg>${enc.peso || ''}</peso_kg>\n`;
            xmlString += `      <presion_arterial>${enc.presion || ''}</presion_arterial>\n`;
            xmlString += `      <diagnostico>${enc.diagnostico || ''}</diagnostico>\n`;
            xmlString += `      <tratamiento>${enc.tratamiento || ''}</tratamiento>\n`;
            xmlString += `      <observaciones>${enc.observaciones || ''}</observaciones>\n`;
            xmlString += `      <documento_adjunto>${enc.pdfData ? 'Si' : 'No'}</documento_adjunto>\n`;
            xmlString += '    </encuentro>\n';
        });
    }
    xmlString += '  </historial_encuentros>\n';
    xmlString += '</expediente_medico>';

    const blob = new Blob([xmlString], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-historial-${id}.xml`; // Nombre de archivo personalizado para el paciente
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Función para exportar datos en formato JSON (Manual y Seguro)
 * Excluye credenciales y se construye manualmente.
 */
function exportarDatosJSON(id) {
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    const paciente = pacientes.find(p => p.ci === id);
    const key = `paciente_${id}`;
    const encuentros = JSON.parse(localStorage.getItem(key)) || [];

    if (!paciente) {
        alert("No se encontraron datos para exportar.");
        return;
    }

    const limpiar = (texto) => {
        if (!texto) return "";
        return texto.toString()
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, ' ');
    };

    let jsonString = '{\n';

    // Info Paciente (Sin Usuario/Password)
    jsonString += '    "info_paciente": {\n';
    jsonString += `        "nombre": "${limpiar(paciente.nombre)}",\n`;
    jsonString += `        "ci": "${limpiar(paciente.ci)}",\n`;
    jsonString += `        "edad": ${paciente.edad},\n`;
    jsonString += `        "telefono": "${limpiar(paciente.telefono || 'N/A')}",\n`;
    jsonString += `        "email": "${limpiar(paciente.email || 'N/A')}",\n`;
    jsonString += `        "alergias": "${limpiar(paciente.alergias || 'Ninguna')}"\n`;
    jsonString += '    },\n';

    // Historial
    jsonString += '    "historial_medico": [\n';
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
        
        if (index < encuentros.length - 1) {
            jsonString += '        },\n';
        } else {
            jsonString += '        }\n';
        }
    });
    jsonString += '    ],\n';

    // Metadata
    jsonString += '    "metadata": {\n';
    jsonString += `        "fecha_exportacion": "${new Date().toISOString()}",\n`;
    jsonString += `        "total_encuentros": ${encuentros.length}\n`;
    jsonString += '    }\n';
    jsonString += '}';

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mi-historial-${id}.json`; // Nombre de archivo personalizado
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}