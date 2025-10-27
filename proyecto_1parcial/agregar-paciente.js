/**
 * Esperamos a que todo el HTML de 'agregar-paciente.html' esté cargado
 * antes de ejecutar cualquier código JavaScript.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // --- BLOQUE 1: SELECCIÓN DE ELEMENTOS ---

    // 1.1. Seleccionamos el formulario principal usando su ID.
    const form = document.getElementById('form-paciente');
    
    // 1.2. Seleccionamos el campo de <input> donde se escribe la Cédula (CI).
    const ciInput = document.getElementById('ci');
    
    // 1.3. Seleccionamos el campo <input> (solo de lectura) donde se
    // mostrará la CI como nombre de usuario.
    const ciDisplayInput = document.getElementById('ci-display');

    
    // --- BLOQUE 2: SINCRONIZACIÓN DE CAMPOS (Autocompletar) ---

    // 2.1. Verificamos que ambos campos (el de CI y el de mostrar CI) existan.
    if (ciInput && ciDisplayInput) {
        
        // 2.2. Añadimos un "escuchador" al campo de CI.
        // El evento 'input' se dispara CADA VEZ que el usuario
        // escribe o borra una letra en ese campo.
        ciInput.addEventListener('input', function() {
            
            // 2.3. Copiamos el valor del campo CI al campo de "display".
            // 'this.value' se refiere al texto que está actualmente
            // dentro del campo 'ciInput'.
            ciDisplayInput.value = this.value;
        });
    }

    
    // --- BLOQUE 3: MANEJO DEL ENVÍO DEL FORMULARIO ---

    // 3.1. Escuchamos el evento 'submit' (envío) del formulario.
    // Esto se activa cuando el usuario hace clic en el botón
    // <button type="submit"> (el botón "Guardar Paciente").
    form.addEventListener('submit', function(event) {
        
        // 3.2. Prevenimos que el formulario recargue la página.
        // Esto nos permite manejar el envío con nuestro propio código.
        event.preventDefault();

        // --- 3.3. DEFINIR REGLAS DE VALIDACIÓN (Regex) ---
        // 'const' declara una variable que no cambiará.
        // Las Expresiones Regulares (Regex) son patrones para buscar texto.
        
        // Este patrón /^\d{10}$/ significa:
        // ^ = Debe empezar aquí
        // \d = Debe ser un dígito numérico (0-9)
        // {10} = Debe tener exactamente 10 dígitos
        // $ = Debe terminar aquí
        const regexNumerico10 = /^\d{10}$/;
        
        // Este patrón busca un formato de email simple (texto@texto.texto)
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

        // --- 3.4. OBTENER VALORES de los campos ---
        // Obtenemos el texto de cada campo y usamos '.trim()'
        // para borrar espacios en blanco al inicio o al final.
        const ci = document.getElementById('ci').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value; // La contraseña no necesita .trim()

        // --- 3.5. EJECUTAR VALIDACIONES ---
        
        // ✔️ Validación de CI (Obligatorio)
        // 'regexNumerico10.test(ci)' devuelve 'true' si la CI cumple
        // el patrón, y 'false' si no.
        // '!' invierte el resultado, así que 'if (!...)' significa
        // "Si la validación FALLA...".
        if (!regexNumerico10.test(ci)) {
            alert('Error: La Cédula (CI) debe tener 10 dígitos numéricos.');
            return; // 'return' detiene la ejecución de la función aquí.
        }
        
        // ✔️ Validación de Teléfono (Opcional)
        // 'if (telefono && ...)' significa:
        // "Si el campo 'telefono' NO está vacío Y ADEMÁS la validación falla..."
        if (telefono && !regexNumerico10.test(telefono)) {
            alert('Error: El Teléfono debe tener 10 dígitos numéricos.');
            return; // Detiene la ejecución.
        }

        // ✔️ Validación de Email (Opcional)
        // "Si el campo 'email' NO está vacío Y ADEMÁS la validación falla..."
        if (email && !regexEmail.test(email)) {
            alert('Error: El formato del correo electrónico no es válido.');
            return; // Detiene la ejecución.
        }
        
        // ✔️ Validación de Contraseña (Obligatoria)
        // 'if (!password)' significa "Si la contraseña está vacía..."
        if (!password) {
            alert('Error: Debe asignar una contraseña para el paciente.');
            return; // Detiene la ejecución.
        }

        // --- 3.6. SI TODO ES VÁLIDO, CONTINUAR CON EL GUARDADO ---
        console.log('Validación exitosa. Guardando paciente...');

        // Cargamos la lista actual de pacientes desde localStorage.
        let pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];

        // Verificamos si ya existe un paciente con esa CI.
        // '.some()' revisa la lista y devuelve 'true' si
        // AL MENOS UN paciente cumple la condición.
        const yaExiste = pacientes.some(paciente => paciente.ci === ci);
        
        if (yaExiste) {
            alert('Error: Ya existe un paciente con esa Cédula (CI).');
            return; // Detiene el envío.
        }

        // 3.7. Crear el objeto 'nuevoPaciente'.
        // Un objeto (representado por {...}) es una colección de
        // propiedades (clave: valor) que agrupa toda la información
        // del paciente.
        const nuevoPaciente = {
            nombre: document.getElementById('nombre').value,
            ci: ci,
            edad: document.getElementById('edad').value,
            telefono: telefono,
            email: email,
            alergias: document.getElementById('alergias').value,
            usuario: ci, // Asignamos la CI como su nombre de usuario.
            password: password
        };
        
        // 3.8. Guardar el paciente.
        
        // 'pacientes.push(...)' añade el nuevo objeto al final de la lista.
        pacientes.push(nuevoPaciente);
        
        // Guardamos la lista ACTUALIZADA de vuelta en localStorage.
        // 'JSON.stringify()' convierte la lista (objeto JS) de nuevo
        // en texto plano para poder guardarla.
        localStorage.setItem('pacientes_lista', JSON.stringify(pacientes));
        
        // 3.9. Informar al usuario y redirigir.
        alert('¡Paciente agregado exitosamente!');
        // 'window.location.href' cambia la página, enviando al
        // doctor de vuelta a su panel principal.
        window.location.href = 'doctor.html';
    });
});