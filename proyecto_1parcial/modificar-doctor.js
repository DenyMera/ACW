/**
 * Este script controla la página 'modificar-doctor.html'.
 * Se ejecuta cuando el HTML está completamente cargado.
 * Sus tareas son:
 * 1. Obtener la CI (ID) del doctor a modificar desde la URL.
 * 2. Cargar los datos de ese doctor desde localStorage.
 * 3. Rellenar el formulario con los datos existentes del doctor.
 * 4. Manejar el guardado de los cambios realizados en el formulario.
 * 5. Manejar la eliminación del doctor.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // --- BLOQUE 1: OBTENER DATOS DEL DOCTOR A MODIFICAR ---

    // 1.1. Leer la URL para obtener la CI del doctor.
    // 'URLSearchParams' nos ayuda a leer los parámetros después del '?'
    const params = new URLSearchParams(window.location.search);
    // 'params.get('id')' extrae el valor del parámetro 'id' (que es la CI).
    const doctorId = params.get('id'); 
    
    // 1.2. Cargar la lista completa de doctores desde localStorage.
    // 'JSON.parse()' convierte el texto guardado en una lista.
    // '|| []' asegura que tengamos una lista vacía si no hay nada guardado.
    let doctores = JSON.parse(localStorage.getItem('doctores_lista')) || [];
    
    // 1.3. Buscar al doctor específico dentro de la lista usando su CI.
    // '.find()' recorre la lista y devuelve el primer doctor ('d')
    // cuya 'd.ci' coincida con el 'doctorId' de la URL.
    const doctor = doctores.find(d => d.ci === doctorId);

    // --- 1.4. Redirección si el doctor no existe ---
    // Si no se encontró el ID en la URL O si no se encontró un doctor
    // con esa CI en la lista...
    if (!doctorId || !doctor) {
        alert('Doctor no encontrado.');
        // Redirigimos al administrador de vuelta a su panel.
        window.location.href = 'admin.html';
        return; // Detenemos la ejecución del script.
    }

    
    // --- BLOQUE 2: RELLENAR EL FORMULARIO CON LOS DATOS EXISTENTES ---

    // 2.1. Usamos un bloque 'try...catch' por seguridad.
    // Si algún 'getElementById' falla (porque el ID está mal en el HTML),
    // el 'catch' capturará el error y lo mostrará en la consola,
    // evitando que el script se rompa por completo.
    try {
        // Asignamos los valores del objeto 'doctor' a los campos
        // correspondientes del formulario HTML.
        document.getElementById('nombre').value = doctor.nombre;
        document.getElementById('ci').value = doctor.ci; // Campo readonly
        document.getElementById('telefono').value = doctor.telefono;
        document.getElementById('usuario').value = doctor.usuario; // Campo readonly
        document.getElementById('password').value = doctor.password; // Mostramos la contraseña actual
    } catch (e) {
        // Si ocurre un error al rellenar, lo mostramos en la consola (F12).
        console.error('Error al rellenar el formulario (faltan IDs):', e);
    }
    
    
    // --- BLOQUE 3: LÓGICA PARA GUARDAR LOS CAMBIOS ---

    // 3.1. Seleccionamos el formulario de modificación.
    const form = document.getElementById('form-mod-doctor');
    
    // 3.2. Escuchamos el evento 'submit' (clic en "Guardar Cambios").
    form.addEventListener('submit', function(event) {
        // 3.3. Prevenimos la recarga de la página.
        event.preventDefault();
        
        // 3.4. Creamos un nuevo objeto 'doctorActualizado' con los valores
        // que están AHORA en los campos del formulario.
        const doctorActualizado = {
            nombre: document.getElementById('nombre').value,
            ci: document.getElementById('ci').value, // La CI no cambia (es readonly).
            telefono: document.getElementById('telefono').value,
            usuario: document.getElementById('usuario').value, // El usuario no cambia (es readonly).
            password: document.getElementById('password').value, // La contraseña puede haber cambiado.
            rol: 'doctor' // Mantenemos el rol.
        };

        // 3.5. Validación de Usuario Único (agregada por si acaso, aunque el campo es readonly).
        // Buscamos si existe OTRO doctor ('d') que tenga el mismo 'usuario'
        // pero DIFERENTE 'ci'.
        const otroDoctorConMismoUsuario = doctores.find(d =>
            d.usuario === doctorActualizado.usuario && d.ci !== doctorActualizado.ci
        );
        // Si encontramos un duplicado...
        if (otroDoctorConMismoUsuario) {
            alert('Error: Ese nombre de usuario ya está en uso por otro doctor.');
            return; // Detenemos el guardado.
        }

        // 3.6. Encontrar la posición (índice) del doctor original en la lista.
        // '.findIndex()' devuelve la posición (0, 1, 2...) del doctor
        // que coincide con el 'doctorId' original. Devuelve -1 si no lo encuentra.
        const index = doctores.findIndex(d => d.ci === doctorId);
        
        // 3.7. Si encontramos la posición...
        if (index !== -1) {
            // Reemplazamos el objeto del doctor antiguo en esa posición
            // con el nuevo objeto 'doctorActualizado'.
            doctores[index] = doctorActualizado;
        }
        
        // 3.8. Guardamos la lista COMPLETA y ACTUALIZADA de doctores
        // de vuelta en localStorage.
        localStorage.setItem('doctores_lista', JSON.stringify(doctores));
        
        // 3.9. Informamos al usuario y redirigimos.
        alert('¡Doctor actualizado exitosamente!');
        window.location.href = 'admin.html';
    });
    
    
    // --- BLOQUE 4: LÓGICA PARA ELIMINAR EL DOCTOR ---

    // 4.1. Seleccionamos el botón "Eliminar".
    const btnEliminar = document.getElementById('btn-eliminar');
    
    // 4.2. Escuchamos el evento 'click' en el botón Eliminar.
    btnEliminar.addEventListener('click', function() {
        
        // --- 4.3. Protección del usuario 'doctor' principal ---
        // Verificamos si el doctor que estamos intentando eliminar
        // es el usuario "sistema" con username 'doctor'.
        if (doctor.usuario === 'doctor') {
            // Si es así, mostramos un error y no hacemos nada más.
            alert('Error: No se puede eliminar al usuario "doctor" principal del sistema.');
            return; // Detenemos la función.
        }
        
        // 4.4. Pedimos confirmación al administrador.
        // 'confirm()' muestra una ventana emergente con "Aceptar" y "Cancelar".
        // Devuelve 'true' si se presiona Aceptar, 'false' si se presiona Cancelar.
        const confirmado = confirm(`¿Está seguro de que desea eliminar a este doctor?\n\n${doctor.nombre}\nUsuario: ${doctor.usuario}\n\nEsta acción no se puede deshacer.`);
        
        // 4.5. Si el administrador confirmó...
        if (confirmado) {
            
            // 4.6. Creamos una nueva lista 'doctoresActualizados' filtrando la original.
            // '.filter()' crea una NUEVA lista que incluye solo a los doctores ('d')
            // cuya 'd.ci' sea DIFERENTE (!==) al 'doctorId' que queremos eliminar.
            // En esencia, copia toda la lista EXCEPTO el doctor a eliminar.
            let doctoresActualizados = doctores.filter(d => d.ci !== doctorId);
            
            // 4.7. Guardamos esta nueva lista (sin el doctor eliminado)
            // en localStorage, sobrescribiendo la anterior.
            localStorage.setItem('doctores_lista', JSON.stringify(doctoresActualizados));
            
            // 4.8. Informamos al usuario y redirigimos.
            alert('Doctor eliminado exitosamente.');
            window.location.href = 'admin.html';
        }
        // Si no confirmó, no se hace nada.
    });
});