/**
 * Este script controla el formulario para agregar un nuevo encuentro clínico.
 * Espera a que el HTML esté completamente cargado antes de ejecutarse.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // --- BLOQUE 1: OBTENER ID DEL PACIENTE Y CONFIGURAR BOTÓN "REGRESAR" ---

    // 1.1. Leer la URL actual de la página.
    // 'window.location.search' nos da la parte de la URL que viene
    // después del '?' (ej., "?id=1234567890").
    const params = new URLSearchParams(window.location.search);
    
    // 1.2. Extraer el valor del parámetro 'id'.
    // Esto nos da la Cédula (CI) del paciente al que pertenece este encuentro.
    const pacienteId = params.get('id');

    // 1.3. Comprobación de seguridad: Si no hay ID en la URL.
    // Esto podría pasar si alguien llega a esta página directamente.
    // Si falta el ID, redirigimos al usuario al panel del doctor.
    if (!pacienteId) {
        window.location.href = 'doctor.html';
        return; // Detiene la ejecución del script aquí.
    }

    // 1.4. Configuramos el botón "Regresar".
    // Buscamos el enlace <a> con id="btn-regresar".
    const btnRegresar = document.getElementById('btn-regresar');
    // Le asignamos el 'href' (destino) para que apunte de vuelta
    // al perfil del paciente correcto, usando el 'pacienteId'.
    btnRegresar.href = `perfil-paciente.html?id=${pacienteId}`;
    
    
    // --- BLOQUE 2: MANEJO DEL ENVÍO DEL FORMULARIO ---

    // 2.1. Seleccionamos el formulario principal.
    const form = document.getElementById('form-encuentro');
    
    // 2.2. Escuchamos el evento 'submit' (cuando se presiona "Agregar").
    form.addEventListener('submit', function(event) {
        
        // 2.3. Prevenimos la recarga automática de la página.
        event.preventDefault(); 

        // --- 2.4. Recopilar los datos de los campos de texto ---
        // Creamos un objeto 'encuentroData' para guardar toda la
        // información del formulario.
        const encuentroData = {
            fecha: document.getElementById('fecha').value,
            motivo: document.getElementById('motivo').value,
            peso: document.getElementById('peso').value,
            presion: document.getElementById('presion').value,
            diagnostico: document.getElementById('diagnostico').value,
            tratamiento: document.getElementById('tratamiento').value,
            observaciones: document.getElementById('observaciones').value,
            // Inicializamos 'pdfData' como nulo. Si el usuario sube un PDF,
            // lo llenaremos más adelante.
            pdfData: null 
        };

        // --- 2.5. Manejar el archivo PDF (si se subió uno) ---

        // Buscamos el campo <input type="file">.
        const fileInput = document.getElementById('pdf-upload');
        // 'fileInput.files' es una lista de los archivos seleccionados.
        // Como solo permitimos uno, tomamos el primero (índice [0]).
        const file = fileInput.files[0];

        // 2.6. Comprobamos si 'file' existe (si el usuario seleccionó un archivo).
        if (file) {
            // Si hay un archivo, necesitamos leer su contenido.
            
            // Creamos un objeto 'FileReader'. Es una herramienta del navegador
            // para leer el contenido de archivos locales.
            const reader = new FileReader();

            // 2.7. Configuramos qué hacer CUANDO el lector termine de leer.
            // 'reader.onload' es un evento que se dispara cuando la lectura
            // del archivo ha finalizado exitosamente.
            reader.onload = function(e) {
                // 'e.target.result' contiene el contenido del archivo leído.
                // Como usamos 'readAsDataURL' (ver abajo), el resultado
                // es una cadena de texto larga que empieza con "data:application/pdf;base64,...".
                // Esta cadena (llamada Data URL o Base64) representa TODO el PDF
                // como texto, lo cual nos permite guardarlo en localStorage.
                encuentroData.pdfData = e.target.result;
                
                // 2.8. ¡IMPORTANTE! Guardamos TODO (texto + PDF) DESPUÉS de leer el archivo.
                // La lectura del archivo toma un pequeño instante. No podemos guardar
                // antes de que termine, por eso llamamos a 'guardarYRedirigir' AQUÍ DENTRO.
                guardarYRedirigir(pacienteId, encuentroData);
            };
            
            // 2.9. Iniciamos la lectura del archivo.
            // Le decimos al lector: "Lee el contenido del 'file' y
            // conviértelo en un Data URL (Base64)".
            reader.readAsDataURL(file);

        } else {
            // 2.10. Si NO se seleccionó ningún archivo.
            // Simplemente llamamos a la función para guardar los datos
            // de texto que ya recopilamos.
            guardarYRedirigir(pacienteId, encuentroData);
        }
    }); // Fin del form.addEventListener('submit')
    
}); // Fin del 'DOMContentLoaded'


// --- BLOQUE 3: DEFINICIÓN DE FUNCIONES AUXILIARES ---

/**
 * Función 'guardarYRedirigir'
 * Esta función es un paso intermedio. Llama a la función que realmente
 * guarda los datos y luego redirige al usuario.
 * @param {string} pacienteId - La CI del paciente.
 * @param {object} encuentro - El objeto con todos los datos del encuentro.
 */
function guardarYRedirigir(pacienteId, encuentro) {
    // 3.1. Llama a la función que hace el trabajo de guardar en localStorage.
    guardarEncuentro(pacienteId, encuentro);
    
    // 3.2. Muestra un mensaje de éxito.
    alert('¡Encuentro agregado exitosamente!');
    
    // 3.3. Redirige al usuario de vuelta al perfil del paciente.
    window.location.href = `perfil-paciente.html?id=${pacienteId}`;
}

/**
 * Función 'guardarEncuentro'
 * Guarda el objeto 'encuentro' en el localStorage del navegador,
 * asociándolo al 'id' (CI) del paciente específico.
 * @param {string} id - La CI del paciente.
 * @param {object} encuentro - El objeto con los datos del encuentro a guardar.
 */
function guardarEncuentro(id, encuentro) {
    
    // 3.4. Creamos una clave única para este paciente.
    // Ej: si id="123", la clave será "paciente_123".
    // Esto asegura que los encuentros de cada paciente se guarden por separado.
    const key = `paciente_${id}`;
    
    // 3.5. Obtenemos la lista de encuentros *existentes* para este paciente.
    // Leemos de localStorage usando la clave única.
    // 'JSON.parse()' convierte el texto guardado en una lista.
    // '|| []' asegura que si no había nada guardado, empecemos con una lista vacía.
    const encuentros = JSON.parse(localStorage.getItem(key)) || [];
    
    // 3.6. Añadimos el nuevo encuentro al final de la lista.
    encuentros.push(encuentro);
    
    // 3.7. Guardamos la lista COMPLETA (con el nuevo encuentro añadido)
    // de vuelta en localStorage, usando la misma clave única.
    // 'JSON.stringify()' convierte la lista de nuevo en texto para guardarla.
    localStorage.setItem(key, JSON.stringify(encuentros));
}