/**
 * Este script controla la página 'modificar-paciente.html'.
 * Se ejecuta cuando el HTML está completamente cargado.
 * Sus tareas principales son:
 * 1. Obtener la CI (ID) del paciente a modificar desde la URL.
 * 2. Cargar los datos de ese paciente desde localStorage.
 * 3. Rellenar el formulario con los datos existentes del paciente.
 * 4. Manejar el guardado de los cambios realizados en el formulario.
 * 5. Manejar la eliminación del paciente (y su historial).
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Imprimimos en la consola (F12) que la página y el script se cargaron.
    console.log('Página "modificar-paciente.html" cargada.');

    // --- BLOQUE 1: OBTENER DATOS DEL PACIENTE A MODIFICAR ---

    // 1.1. Leemos la URL para obtener la CI del paciente.
    const params = new URLSearchParams(window.location.search);
    const pacienteId = params.get('id'); // 'id' es la CI.
    
    // 1.2. Cargamos la lista completa de pacientes desde localStorage.
    let pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    
    // 1.3. Buscamos al paciente específico dentro de la lista usando su CI.
    const paciente = pacientes.find(p => p.ci === pacienteId);
    
    // --- 1.4. Redirección si el paciente no existe ---
    // Si no se encontró el ID en la URL O si no se encontró un paciente con esa CI...
    if (!pacienteId || !paciente) {
        alert('ERROR: Paciente no encontrado.');
        // Redirigimos al administrador de vuelta a su panel.
        window.location.href = 'admin.html';
        return; // Detenemos la ejecución del script.
    }

    // Imprimimos en consola los datos del paciente encontrado (para depuración).
    console.log('Paciente encontrado:', paciente);

    // --- BLOQUE 2: RELLENAR EL FORMULARIO CON LOS DATOS EXISTENTES ---

    // 2.1. Usamos 'try...catch' para manejar posibles errores.
    // Si algún 'getElementById' falla (ej. ID mal escrito en HTML),
    // el error se mostrará en consola sin detener todo el script.
    try {
        // Asignamos los valores del objeto 'paciente' a los campos
        // correspondientes del formulario HTML.
        document.getElementById('nombre').value = paciente.nombre;
        document.getElementById('ci').value = paciente.ci; // Campo readonly
        document.getElementById('edad').value = paciente.edad;
        document.getElementById('telefono').value = paciente.telefono;
        document.getElementById('email').value = paciente.email;
        // Cargamos también el usuario y la contraseña existentes.
        document.getElementById('usuario').value = paciente.usuario; 
        document.getElementById('password').value = paciente.password; 
        
        console.log('Formulario rellenado con éxito.');
    } catch (e) {
        // Si ocurre un error, lo mostramos en la consola.
        console.error('Error al rellenar el formulario (faltan IDs):', e);
    }

    // --- BLOQUE 3: LÓGICA PARA GUARDAR LOS CAMBIOS ---

    // 3.1. Seleccionamos el formulario de modificación.
    const form = document.getElementById('form-mod-paciente');
    
    // 3.2. Escuchamos el evento 'submit' (clic en "Guardar Cambios").
    form.addEventListener('submit', function(event) {
        // 3.3. Prevenimos la recarga de la página.
        event.preventDefault();

        // 3.4. Creamos un nuevo objeto 'pacienteActualizado' con los valores
        // que están AHORA escritos en los campos del formulario.
        const pacienteActualizado = {
            nombre: document.getElementById('nombre').value,
            ci: document.getElementById('ci').value, // La CI no cambia.
            edad: document.getElementById('edad').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value,
            // (Aquí faltaba el campo 'alergias', lo agrego basado en tu HTML)
            alergias: document.getElementById('alergias').value, 
            usuario: document.getElementById('usuario').value, // Puede haber cambiado.
            password: document.getElementById('password').value // Puede haber cambiado.
        };

        // 3.5. Validación de Usuario Único.
        // Buscamos si existe OTRO paciente ('p') que tenga el mismo 'usuario'
        // pero DIFERENTE 'ci'.
        const otroPacienteConMismoUsuario = pacientes.find(p => 
            p.usuario === pacienteActualizado.usuario && p.ci !== pacienteActualizado.ci
        );
        // Si encontramos un duplicado...
        if (otroPacienteConMismoUsuario) {
            alert('Error: Ese nombre de usuario ya está en uso por otro paciente.');
            return; // Detenemos el guardado.
        }

        // 3.6. Encontrar la posición (índice) del paciente original en la lista.
        // '.findIndex()' nos dice en qué lugar de la lista (0, 1, 2...) está
        // el paciente que estamos modificando.
        const index = pacientes.findIndex(p => p.ci === pacienteId);
        
        // 3.7. Si encontramos la posición (el índice no es -1)...
        if (index !== -1) {
            // Reemplazamos el objeto del paciente antiguo en esa posición
            // con el nuevo objeto 'pacienteActualizado'.
            pacientes[index] = pacienteActualizado;
            console.log('Paciente actualizado en la lista.'); // Mensaje para consola
        }
        
        // 3.8. Guardamos la lista COMPLETA y ACTUALIZADA de pacientes
        // de vuelta en localStorage.
        localStorage.setItem('pacientes_lista', JSON.stringify(pacientes));
        
        // 3.9. Informamos al usuario y redirigimos.
        alert('¡Paciente actualizado exitosamente!');
        window.location.href = 'admin.html';
    });

    // --- BLOQUE 4: LÓGICA PARA ELIMINAR EL PACIENTE ---

    // 4.1. Seleccionamos el botón "Eliminar".
    const btnEliminar = document.getElementById('btn-eliminar');
    
    // 4.2. Escuchamos el evento 'click' en el botón Eliminar.
    btnEliminar.addEventListener('click', function() {
        
        // 4.3. Pedimos confirmación al administrador.
        // 'confirm()' muestra una ventana emergente. Si el usuario
        // presiona "Aceptar", devuelve 'true'. Si presiona "Cancelar", 'false'.
        const confirmado = confirm(`¿Está seguro de que desea eliminar a este paciente?\n\n${paciente.nombre}\nCI: ${paciente.ci}\n\nEsta acción también borrará todo su historial clínico y no se puede deshacer.`);
        
        // 4.4. Si el administrador confirmó...
        if (confirmado) {
            
            // 4.5. Creamos una nueva lista 'pacientesActualizados' filtrando la original.
            // '.filter()' crea una NUEVA lista que incluye solo a los pacientes ('p')
            // cuya 'p.ci' sea DIFERENTE (!==) al 'pacienteId' que queremos eliminar.
            let pacientesActualizados = pacientes.filter(p => p.ci !== pacienteId);
            
            // 4.6. Guardamos esta nueva lista (sin el paciente eliminado)
            // en localStorage, sobrescribiendo la anterior.
            localStorage.setItem('pacientes_lista', JSON.stringify(pacientesActualizados));
            
            // 4.7. MUY IMPORTANTE: Eliminar también el historial clínico de este paciente.
            // Los historiales se guardan con una clave única como 'paciente_12345'.
            // 'localStorage.removeItem()' borra ese dato específico.
            localStorage.removeItem(`paciente_${pacienteId}`);
            
            // 4.8. Informamos al usuario y redirigimos.
            alert('Paciente eliminado exitosamente.');
            window.location.href = 'admin.html';
        }
        // Si no confirmó (confirmado es 'false'), no se hace nada.
    });
});