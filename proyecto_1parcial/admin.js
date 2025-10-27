/**
 * Este evento 'DOMContentLoaded' es el punto de partida.
 * Le dice al navegador: "Espera a que todo el HTML de 'admin.html'
 * esté completamente cargado, y SÓLO ENTONCES ejecuta el código
 * que está dentro de esta función".
 * Esto evita errores comunes, como intentar encontrar un botón
 * que todavía no existe en la página.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // 'console.log' imprime un mensaje en la consola del navegador (F12).
    // Es una herramienta de depuración para saber que nuestro script
    // ha comenzado a ejecutarse correctamente.
    console.log('admin.js: DOM cargado.');

    // --- BLOQUE 1: FUNCIONALIDAD "BUSCAR USUARIO" ---

    // 1.1. Seleccionamos el botón "Buscar Usuario" del HTML usando su ID.
    // Guardamos el botón en la variable 'btnBuscar'.
    const btnBuscar = document.getElementById('btn-buscar-usuario');
    
    // 1.2. Verificamos si el botón fue encontrado.
    // 'if (btnBuscar)' es una comprobación de seguridad. Si 'btnBuscar'
    // NO es nulo (es decir, SÍ lo encontró), ejecuta el código adentro.
    if (btnBuscar) {
        // Imprimimos en consola que el botón se encontró.
        console.log('admin.js: Botón "Buscar Usuario" encontrado.');
        
        // 1.3. Añadimos un "escuchador de eventos" al botón.
        // Ahora, cada vez que el usuario haga 'click' en este botón,
        // se ejecutará la función interna.
        btnBuscar.addEventListener('click', function(event) {
            
            // 1.4. Prevenimos el comportamiento por defecto del enlace (<a>).
            // Como el botón es una etiqueta <a> con href="#", hacer clic
            // haría que la página "saltara" a la parte superior.
            // 'event.preventDefault()' cancela esa acción.
            event.preventDefault(); 
            console.log('admin.js: Clic en "Buscar Usuario".');
            
            // 1.5. Pedimos la Cédula (CI) al administrador.
            // 'prompt()' muestra una pequeña ventana emergente que pide
            // al usuario que escriba un texto.
            const ciBuscada = prompt("Ingrese el número de cédula (CI) del usuario:");
            
            // 1.6. Verificamos si el admin presionó "Cancelar" o no escribió nada.
            // '!ciBuscada' significa que 'ciBuscada' es nulo (presionó Cancelar).
            // 'ciBuscada.trim() === ""' significa que escribió espacios en blanco.
            if (!ciBuscada || ciBuscada.trim() === "") {
                console.log('admin.js: Búsqueda cancelada.');
                return; // 'return' detiene la función aquí mismo.
            }
            
            // Imprimimos la CI que vamos a buscar.
            console.log(`admin.js: Buscando CI: ${ciBuscada}`);
            
            // 1.7. Cargamos AMBAS listas de usuarios desde el localStorage.
            // 'localStorage' es la "base de datos" del navegador.
            // 'JSON.parse()' convierte el texto guardado de nuevo en una lista (Array).
            // '|| []' significa "o si no encuentras nada, usa una lista vacía".
            const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
            const doctores = JSON.parse(localStorage.getItem('doctores_lista')) || [];
            
            // 1.8. Buscamos primero en la lista de pacientes.
            // '.find(p => ...)' recorre la lista de pacientes y busca
            // al primer 'p' (paciente) cuya 'p.ci' sea igual a la 'ciBuscada'.
            // '.trim()' quita espacios al inicio y al final de lo que escribió el admin.
            const pacienteEncontrado = pacientes.find(p => p.ci === ciBuscada.trim());
            
            // 1.9. Si encontramos un paciente...
            if (pacienteEncontrado) {
                console.log('admin.js: Paciente encontrado. Redirigiendo a modificar-paciente.html...');
                // Redirigimos al navegador a la página de modificación,
                // pasando la CI del paciente en la URL (ej: ...?id=12345).
                window.location.href = `modificar-paciente.html?id=${pacienteEncontrado.ci}`;
                return; // Detenemos la función.
            }

            // 1.10. Si no fue paciente, buscamos en la lista de doctores.
            const doctorEncontrado = doctores.find(d => d.ci === ciBuscada.trim());
            
            // 1.11. Si encontramos un doctor...
            if (doctorEncontrado) {
                console.log('admin.js: Doctor encontrado. Redirigiendo a modificar-doctor.html...');
                // Redirigimos a la página de modificación del doctor.
                window.location.href = `modificar-doctor.html?id=${doctorEncontrado.ci}`;
                return; // Detenemos la función.
            }

            // 1.12. Si no se encuentra en ninguna lista.
            console.log('admin.js: Usuario no encontrado en ninguna lista.');
            alert("No existe un usuario con esa cédula.");
        });
    } else {
        // Este mensaje solo aparece si hay un error en el HTML
        // (por ejemplo, si escribimos mal el id="btn-buscar-usuario").
        console.error('admin.js: ERROR FATAL - No se encontró el botón con id="btn-buscar-usuario"');
    }
    
    // --- BLOQUE 2: CARGA DE LA TABLA DE USUARIOS ---
    
    // 2.1. "Sembrar" la base de datos.
    // Llamamos a la función (definida más abajo) que crea los
    // usuarios por defecto si las listas están vacías.
    inicializarListas();
    
    // 2.2. Seleccionamos el cuerpo (tbody) de la tabla.
    const tbody = document.getElementById('usuarios-tbody');
    
    // 2.3. Limpiamos la tabla.
    // Esto asegura que si recargamos la info, no se dupliquen las filas.
    tbody.innerHTML = ''; 

    // 2.4. Cargamos la lista de Doctores en la tabla.
    const doctores = JSON.parse(localStorage.getItem('doctores_lista')) || [];
    
    // 'forEach' es un bucle: "Para cada 'doc' en la lista 'doctores'..."
    doctores.forEach(doc => {
        // Creamos una nueva etiqueta <tr> (fila) en la memoria.
        const fila = document.createElement('tr');
        
        // 2.5. Rellenamos la fila con celdas (<td>).
        // Usamos plantillas literales (``) para construir el HTML fácilmente.
        // '${doc.nombre}' inserta el valor de la variable.
        fila.innerHTML = `
            <td><span class="role doctor">Doctor</span></td>
            <td>${doc.nombre}</td>
            <td>${doc.usuario} (CI: ${doc.ci})</td>
            <td>${doc.telefono}</td>
            <td><a href="modificar-doctor.html?id=${doc.ci}" class="action-btn">Modificar</a></td>
        `;
        
        // 2.6. Añadimos la nueva fila (con todo su contenido) al <tbody>
        // en la página web, haciéndola visible.
        tbody.appendChild(fila);
    });

    // 2.7. Cargamos la lista de Pacientes en la tabla (mismo proceso).
    const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
    pacientes.forEach(paciente => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><span class="role patient">Paciente</span></td>
            <td>${paciente.nombre}</td>
            <td>${paciente.ci}</td>
            <td>${paciente.telefono}</td>
            <td><a href="modificar-paciente.html?id=${paciente.ci}" class="action-btn">Modificar</a></td>
        `;
        tbody.appendChild(fila);
    });
}); // <-- Fin del 'DOMContentLoaded'

// --- BLOQUE 3: DEFINICIÓN DE FUNCIONES ---
// (Estas funciones están fuera del 'DOMContentLoaded' pero son
// llamadas por el código que está dentro de él).

/**
 * Función 'inicializarListas'
 * Su trabajo es crear los usuarios por defecto (admin, doctores, pacientes)
 * la PRIMERA VEZ que se abre la aplicación.
 * Lo sabe porque revisa si la lista en localStorage es 'null' (no existe).
 */
function inicializarListas() {
    
    // 3.1. Sembrar Doctores
    // 'localStorage.getItem(...)' revisa si existe algo guardado
    // con la clave 'doctores_lista'.
    if (localStorage.getItem('doctores_lista') === null) {
        // Si es 'null' (no existe), creamos la lista por defecto.
        let doctoresDefecto = [
            { nombre: "Dr. (Sistema)", ci: "9999999999", telefono: "N/A", usuario: "doctor", password: "12345", rol: "doctor" }
        ];
        // 'JSON.stringify' convierte la lista de objetos en un texto plano
        // para poder guardarla en localStorage.
        localStorage.setItem('doctores_lista', JSON.stringify(doctoresDefecto));
    }
    
    // 3.2. Sembrar Pacientes (mismo proceso)
    if (localStorage.getItem('pacientes_lista') === null) {
        const defaultPacientes = [
            { 
                nombre: "Carlos Andrade Vera", ci: "1315896547", edad: 34, 
                telefono: "0987654321", email: "candrade@email.com", 
                alergias: "Penicilina", 
                usuario: "1315896547", // El usuario es la CI
                password: "123"
            },
            { 
                nombre: "Ana Zambrano Ponce", ci: "1309874563", edad: 28, 
                telefono: "0991234567", email: "azambrano@email.com", 
                alergias: "Ninguna", 
                usuario: "1309874563", // El usuario es la CI
                password: "123" 
            },
            { 
                nombre: "Luis Mendoza Cedeño", ci: "1311223344", edad: 45, 
                telefono: "0988776655", email: "lmendoza@email.com", 
                alergias: "Polvo", 
                usuario: "1311223344", // El usuario es la CI
                password: "123"
            }
        ];
        localStorage.setItem('pacientes_lista', JSON.stringify(defaultPacientes));
    }
}