/**
 * Este script controla la página principal del doctor ('doctor.html').
 * Sus tareas son:
 * 1. Mostrar el nombre del doctor que inició sesión.
 * 2. Permitir buscar pacientes por CI.
 * 3. Crear la lista de pacientes por defecto si es la primera vez que se usa.
 * 4. Cargar y mostrar la lista de todos los pacientes en una tabla.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // --- BLOQUE 1: CARGAR INFORMACIÓN DEL DOCTOR ---
    
    // 1.1. Llamamos a la función (definida más abajo) que se encarga
    // de leer el nombre del doctor guardado en la memoria temporal
    // del navegador y mostrarlo en la barra lateral.
    cargarInfoDoctor();

    // --- BLOQUE 2: FUNCIONALIDAD "BUSCAR PACIENTE" ---

    // 2.1. Seleccionamos el botón "Buscar Paciente" de la barra lateral.
    const btnBuscar = document.getElementById('btn-buscar-paciente');
    
    // 2.2. Verificamos si el botón existe.
    if (btnBuscar) {
        // 2.3. Añadimos un "escuchador" para el evento 'click'.
        btnBuscar.addEventListener('click', function(event) {
            
            // 2.4. Prevenimos que el enlace '#' recargue la página.
            event.preventDefault(); 
            
            // 2.5. Pedimos al doctor que ingrese la Cédula (CI) del paciente.
            const ciBuscada = prompt("Ingrese el número de cédula del paciente:");
            
            // 2.6. Si el doctor cancela o no escribe nada, detenemos la función.
            if (!ciBuscada || ciBuscada.trim() === "") return; 
            
            // 2.7. Cargamos la lista de pacientes desde localStorage.
            const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
            
            // 2.8. Buscamos en la lista al paciente que coincida con la CI buscada.
            const pacienteEncontrado = pacientes.find(paciente => paciente.ci === ciBuscada.trim());
            
            // 2.9. Si lo encontramos...
            if (pacienteEncontrado) {
                alert("Paciente encontrado. Abriendo perfil...");
                // Redirigimos al doctor a la página del perfil del paciente,
                // pasando la CI del paciente en la URL.
                window.location.href = `perfil-paciente.html?id=${pacienteEncontrado.ci}`;
            } else {
                // 2.10. Si no lo encontramos...
                alert("No existe un paciente con esa cédula.");
            }
        });
    } // Fin del if(btnBuscar)

    // --- BLOQUE 3: CARGA INICIAL DE PACIENTES ---
    
    // 3.1. (Este código parece estar incompleto o es un remanente)
    // Define una lista vacía. En versiones anteriores, aquí estaban los
    // pacientes por defecto, pero ahora esa lógica está en 'inicializarPacientes'.
    const defaultPacientes = [ /* Debería estar vacío o eliminado si la lógica está en la función */ ];
    
    // 3.2. Llamamos a la función que "siembra" la base de datos con
    // pacientes por defecto si es necesario.
    // NOTA: Se le pasa 'defaultPacientes' que está vacío. La función 'inicializarPacientes'
    // debería tener los datos por defecto definidos DENTRO de ella, como en admin.js.
    // (Mantendré la estructura que me pasaste, pero esto podría ser un error lógico).
    inicializarPacientes(defaultPacientes); 
    
    // 3.3. Llamamos a la función que carga y muestra la lista de pacientes
    // en la tabla HTML.
    cargarPacientesEnTabla();
    
}); // <-- Fin del 'DOMContentLoaded'


// --- BLOQUE 4: DEFINICIÓN DE FUNCIONES ---

/**
 * Función 'cargarInfoDoctor'
 * Lee el nombre del doctor (guardado durante el login en 'sessionStorage')
 * y lo muestra en el encabezado de la barra lateral.
 * También verifica si la sesión existe; si no, redirige al login.
 */
function cargarInfoDoctor() {
    // 4.1. Leemos el nombre de la memoria temporal 'sessionStorage'.
    const nombreDoctor = sessionStorage.getItem('doctorName');
    
    // 4.2. Verificamos si el nombre existe.
    // Si 'nombreDoctor' es nulo (no hay sesión activa)...
    if (!nombreDoctor) {
        alert('Sesión no encontrada. Por favor, inicie sesión.');
        // Redirigimos al usuario a la página de inicio de sesión.
        window.location.href = 'index.html';
        return; // Detenemos la función.
    }
    
    // 4.3. Mostramos el nombre en el HTML.
    // Buscamos el elemento <h3> con id="doctor-name".
    const nameElement = document.getElementById('doctor-name');
    // Si lo encontramos...
    if (nameElement) {
        // Reemplazamos su contenido de texto con el nombre del doctor.
        nameElement.textContent = nombreDoctor; 
    }
}

/**
 * Función 'inicializarPacientes'
 * Revisa si la lista de pacientes ya existe en localStorage.
 * Si no existe (es null), la crea usando la lista 'pacientesPorDefecto'.
 * NOTA: Como se mencionó antes, 'pacientesPorDefecto' probablemente debería
 * estar definida DENTRO de esta función para que funcione correctamente
 * al llamarla desde DOMContentLoaded.
 */
function inicializarPacientes(pacientesPorDefecto) {
    // 4.4. Verificamos si la lista 'pacientes_lista' existe.
    const lista = localStorage.getItem('pacientes_lista');
    
    // 4.5. Si no existe...
    if (lista === null) {
        // (Aquí debería estar la definición de los pacientes por defecto)
        // const defaultPacientes = [ {nombre: "...", ci: "..."}, ... ];
        
        // Guardamos la lista por defecto en localStorage.
        localStorage.setItem('pacientes_lista', JSON.stringify(pacientesPorDefecto)); // Usa la variable (posiblemente vacía) pasada como argumento
    }
}

/**
 * Función 'cargarPacientesEnTabla'
 * Lee la lista completa de pacientes desde localStorage y crea
 * una fila (<tr>) en la tabla HTML por cada paciente encontrado.
 */
function cargarPacientesEnTabla() {
    
    // 4.6. Seleccionamos el cuerpo (tbody) de la tabla de pacientes.
    const tbody = document.getElementById('pacientes-tbody');
    
    // 4.7. Cargamos la lista de pacientes desde localStorage.
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    
    // 4.8. Limpiamos cualquier contenido previo de la tabla.
    tbody.innerHTML = ''; 
    
    // 4.9. Verificamos si la lista está vacía.
    if (pacientes.length === 0) {
        // Si está vacía, mostramos un mensaje en una fila.
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay pacientes registrados.</td></tr>';
        return; // Terminamos la función.
    }
    
    // 4.10. Si hay pacientes, recorremos la lista uno por uno.
    pacientes.forEach(paciente => {
        // Creamos una nueva fila <tr>.
        const fila = document.createElement('tr');
        // Rellenamos la fila con las celdas <td> y los datos del paciente.
        fila.innerHTML = `
            <td>${paciente.nombre}</td>
            <td>${paciente.ci}</td>
            <td>${paciente.edad}</td>
            <td>${paciente.telefono}</td>
            <td>
                <a href="perfil-paciente.html?id=${paciente.ci}" class="action-btn">Ver Perfil</a>
            </td>
        `;
        // Añadimos la fila completa al <tbody> de la tabla.
        tbody.appendChild(fila);
    });
}