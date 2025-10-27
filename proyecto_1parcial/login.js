/**
 * Este es el punto de entrada de nuestro script.
 * 'document.addEventListener' es como un "vigilante" que espera a que 
 * ocurra un evento en la página.
 * El evento 'DOMContentLoaded' se dispara justo cuando el navegador ha
 * terminado de cargar todo el HTML.
 *
 * ¿Por qué esperamos? Si intentáramos buscar un botón (como 'login-form')
 * ANTES de que el HTML exista, el script fallaría. Con esto nos aseguramos
 * de que todos los elementos están listos para ser controlados.
 */
document.addEventListener('DOMContentLoaded', function() {

    // --- BLOQUE 1: MANEJO DEL INICIO DE SESIÓN ---

    // 1.1. Seleccionamos el formulario de login.
    // Usamos 'document.getElementById' para encontrar el elemento en nuestro
    // HTML que tiene el ID "login-form". Lo guardamos en una variable
    // llamada 'loginForm' para usarlo fácilmente.
    const loginForm = document.getElementById('login-form');

    // 1.2. Escuchamos el evento 'submit' (envío) del formulario.
    // Un formulario se "envía" (submit) cuando presionas Enter en un campo
    // o haces clic en un botón de tipo <button type="submit">.
    // Cuando eso pasa, se ejecuta la función que está adentro.
    loginForm.addEventListener('submit', function(event) {
        
        // 1.3. Prevenimos el comportamiento por defecto.
        // Por defecto, un formulario HTML recarga la página al enviarse.
        // 'event.preventDefault()' CANCELA esa recarga, permitiéndonos
        // manejar todo con nuestro propio código JavaScript.
        event.preventDefault();

        // 1.4. Obtenemos los valores que el usuario escribió.
        // Vamos a los campos <input> (usando sus IDs) y sacamos el
        // texto que tienen escrito adentro con '.value'.
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // 1.5. Limpiamos la sesión anterior.
        // 'sessionStorage' es una memoria temporal del navegador.
        // Si un doctor ya estaba logueado, aquí "olvidamos" su nombre
        // para preparar un nuevo inicio de sesión limpio.
        sessionStorage.removeItem('doctorName');

        
        // --- BLOQUE 2: LÓGICA DE ROLES (¿Quién está iniciando sesión?) ---

        // 2.1. Verificación del Administrador.
        // Comparamos si el usuario y contraseña son EXACTAMENTE 'admin' y 'admin123'.
        // Estas son credenciales "hardcodeadas" (fijas en el código).
        if (username === 'admin' && password === 'admin123') {
            alert('Inicio de sesión (Admin) exitoso. Redirigiendo...');
            // 'window.location.href' es la línea que le dice al navegador:
            // "Carga esta nueva página AHORA".
            window.location.href = 'admin.html';
            return; // 'return' detiene la función aquí. No sigue verificando más.
        }

        // 2.2. Verificación del Doctor.
        // 'localStorage' es la "base de datos" de nuestro navegador.
        // Obtenemos la 'doctores_lista' (que está guardada como texto).
        // 'JSON.parse()' convierte ese texto de vuelta a una lista de objetos
        // que JavaScript puede entender.
        // El '|| []' es un truco de seguridad: si no encuentra la lista (es nula),
        // usa una lista vacía '[]' para evitar que el script se rompa.
        const doctores = JSON.parse(localStorage.getItem('doctores_lista')) || [];
        
        // Usamos '.find()' para buscar en la lista de doctores.
        // Es como decir: "Revisa cada 'doc' en la lista 'doctores' y
        // devuélveme el PRIMERO que cumpla esta condición".
        // La condición es que el 'doc.usuario' y 'doc.password' guardados
        // sean iguales a los que el usuario escribió.
        const doctorEncontrado = doctores.find(doc => 
            doc.usuario === username && doc.password === password
        );

        // Si 'doctorEncontrado' NO es nulo (es decir, encontró uno)...
        if (doctorEncontrado) {
            // Guardamos el nombre del doctor en la memoria temporal.
            // Esto es para que la siguiente página ('doctor.html') pueda
            // saber quién inició sesión y mostrar su nombre.
            sessionStorage.setItem('doctorName', doctorEncontrado.nombre);
            
            alert(`Inicio de sesión (Doctor: ${doctorEncontrado.nombre}) exitoso. Redirigiendo...`);
            window.location.href = 'doctor.html';
            return; // Detenemos la función.
        }

        // 2.3. Verificación del Paciente (mismo proceso que el doctor).
        const pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
        const pacienteEncontrado = pacientes.find(p => 
            p.usuario === username && p.password === password
        );

        if (pacienteEncontrado) {
            alert(`Inicio de sesión (Paciente: ${pacienteEncontrado.nombre}) exitoso. Redirigiendo...`);
            // Aquí, la redirección es especial.
            // Mandamos al usuario a 'paciente-vista.html' PERO
            // le pasamos su CI (Cédula) en la URL (ej. ...?id=1234567890).
            // Así, la siguiente página sabrá qué historial de paciente debe cargar.
            window.location.href = `paciente-vista.html?id=${pacienteEncontrado.ci}`;
            return;
        }

        // 2.4. Falla de inicio de sesión.
        // Si el código llega hasta aquí, significa que ninguno de los 'if'
        // anteriores tuvo éxito. El usuario no es admin, ni doctor, ni paciente.
        alert('Usuario o contraseña incorrectos.');
    });

    
    // --- BLOQUE 3: MANEJO DEL BOTÓN "RECUPERAR CONTRASEÑA" ---

    // 3.1. Seleccionamos el botón de recuperar.
    const recoverButton = document.getElementById('btn-recover');

    // 3.2. Escuchamos el evento 'click' en ese botón.
    recoverButton.addEventListener('click', function() {
        // A diferencia del 'submit', este es un botón simple,
        // por lo que no necesitamos 'event.preventDefault()'.
        
        // 3.3. Mostramos una alerta simple con información de ayuda.
        alert(
            'Para recuperar su contraseña, por favor contacte a soporte:\n\n' +
            'Correo: soporte.policlinico@email.com\n' +
            'Teléfono: (099) 123-4567'
        );
    });

});