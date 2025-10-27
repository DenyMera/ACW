/**
 * Este script controla la página 'agregar-usuario.html'.
 * Sus tareas principales son:
 * 1. Mostrar u ocultar campos del formulario según el rol seleccionado (Doctor o Paciente).
 * 2. Autocompletar el campo "Usuario" con la Cédula (CI).
 * 3. Validar los datos ingresados antes de guardar.
 * 4. Guardar los datos del nuevo usuario (Doctor o Paciente) en la lista
 * correspondiente dentro del localStorage del navegador.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    // Imprime un mensaje en la consola (F12) para saber que el script empezó.
    console.log('agregar-usuario.js: DOM cargado.');

    // --- BLOQUE 1: SELECCIÓN DE ELEMENTOS IMPORTANTES ---
    // Guardamos en variables las referencias a los elementos HTML
    // que vamos a necesitar controlar con JavaScript.
    
    // El menú desplegable (<select>) para elegir el rol.
    const rolSelect = document.getElementById('rol');
    // El <div> que contiene los campos específicos del Doctor.
    const camposDoctor = document.getElementById('campos-doctor');
    // El <div> que contiene los campos específicos del Paciente.
    const camposPaciente = document.getElementById('campos-paciente');
    // El formulario (<form>) principal.
    const form = document.getElementById('form-usuario');
    // El campo <input> donde se escribe la Cédula (CI).
    const ciInput = document.getElementById('ci');
    // El campo <input> para el nombre de usuario del Paciente.
    const pacUsuarioInput = document.getElementById('p-usuario');
    // El campo <input> para el nombre de usuario del Doctor.
    const docUsuarioInput = document.getElementById('usuario');

    
    // --- BLOQUE 2: SINCRONIZACIÓN CI -> USUARIO (Autocompletar) ---
    
    // 2.1. Verificamos que todos los campos necesarios existan.
    // Esto previene errores si algún ID estuviera mal escrito en el HTML.
    if (ciInput && pacUsuarioInput && docUsuarioInput) {
        console.log('agregar-usuario.js: Campos de CI y Usuarios (paciente y doctor) encontrados.');
        
        // 2.2. Añadimos un "escuchador" al campo de CI.
        // El evento 'input' se activa cada vez que el usuario escribe
        // o borra algo en el campo CI.
        ciInput.addEventListener('input', function() {
            // 2.3. Copiamos el valor actual de la CI a AMBOS campos de usuario.
            // 'this.value' se refiere al texto dentro del campo 'ciInput'.
            pacUsuarioInput.value = this.value;
            docUsuarioInput.value = this.value;
            
            // Imprimimos en consola para depuración.
            console.log(`Escribiendo en CI... copiando '${this.value}' a ambos campos de usuario.`);
        });
    } else {
        // Si falta algún campo, mostramos un error en la consola.
        console.error('agregar-usuario.js: ERROR! No se encontró id="ci", id="p-usuario" o id="usuario".');
    }

    
    // --- BLOQUE 3: LÓGICA PARA MOSTRAR/OCULTAR CAMPOS SEGÚN EL ROL ---

    // 3.1. Añadimos un "escuchador" al menú desplegable (<select>) de Rol.
    // El evento 'change' se activa cuando el usuario selecciona una opción diferente.
    rolSelect.addEventListener('change', function() {
        // Imprimimos el rol seleccionado en la consola.
        console.log(`Rol cambiado a: ${this.value}`);
        
        // 3.2. Si el rol seleccionado es 'doctor'...
        if (this.value === 'doctor') {
            // Mostramos los campos del doctor quitando la clase CSS 'hidden'.
            camposDoctor.classList.remove('hidden');
            // Ocultamos los campos del paciente añadiendo la clase CSS 'hidden'.
            camposPaciente.classList.add('hidden');
            
            // Sincronizamos la CI actual al campo de usuario del doctor.
            // Esto es útil si el usuario escribe la CI y LUEGO cambia el rol.
            docUsuarioInput.value = ciInput.value; 

            // Hacemos que los campos de usuario y contraseña del doctor
            // sean OBLIGATORIOS (required) para el formulario HTML.
            document.getElementById('usuario').required = true;
            document.getElementById('password').required = true;
            
            // Quitamos el 'required' de los campos de paciente, ya que están ocultos.
            document.getElementById('edad').required = false;
            document.getElementById('p-usuario').required = false;
            document.getElementById('p-password').required = false;

        // 3.3. Si el rol seleccionado es 'paciente'...
        } else if (this.value === 'paciente') {
            // Ocultamos los campos del doctor.
            camposDoctor.classList.add('hidden');
            // Mostramos los campos del paciente.
            camposPaciente.classList.remove('hidden');
            
            // Quitamos el 'required' de los campos de doctor.
            document.getElementById('usuario').required = false;
            document.getElementById('password').required = false;
            
            // Hacemos que la edad del paciente sea obligatoria.
            document.getElementById('edad').required = true;
            
            // Sincronizamos la CI actual al campo de usuario del paciente.
            pacUsuarioInput.value = ciInput.value; 
            // Hacemos que el usuario y contraseña del paciente sean obligatorios.
            pacUsuarioInput.required = true;
            document.getElementById('p-password').required = true;
            
        // 3.4. Si no se selecciona ningún rol (ej. la opción "-- Seleccione --")...
        } else {
            // Ocultamos ambos grupos de campos específicos.
            camposDoctor.classList.add('hidden');
            camposPaciente.classList.add('hidden');
        }
    });

    
    // --- BLOQUE 4: MANEJO DEL ENVÍO DEL FORMULARIO (GUARDAR USUARIO) ---

    // 4.1. Escuchamos el evento 'submit' del formulario principal.
    form.addEventListener('submit', function(event) {
        
        // 4.2. Prevenimos la recarga de la página.
        event.preventDefault();
        
        // --- 4.3. Definimos las reglas de validación (Regex) ---
        const regexNumerico10 = /^\d{10}$/; // Exactamente 10 dígitos numéricos.
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato de email simple.
        
        // --- 4.4. Obtenemos los valores de los campos comunes ---
        const rol = rolSelect.value; // El rol seleccionado ('doctor' o 'paciente').
        const nombre = document.getElementById('nombre').value.trim(); // Nombre completo.
        const ci = document.getElementById('ci').value.trim(); // Cédula.
        const telefono = document.getElementById('telefono').value.trim(); // Teléfono.
        
        // --- 4.5. Realizamos las validaciones comunes ---
        if (!regexNumerico10.test(ci)) {
            alert('Error: La Cédula (CI) debe tener 10 dígitos numéricos.');
            return; // Detiene el proceso.
        }
        // El teléfono solo se valida si el usuario escribió algo.
        if (telefono && !regexNumerico10.test(telefono)) {
            alert('Error: El Teléfono debe tener 10 dígitos numéricos.');
            return; // Detiene el proceso.
        }

        // --- 4.6. Validación y guardado específico según el ROL ---
        
        if (rol === 'paciente') {
            // Obtenemos los valores de los campos específicos del paciente.
            const email = document.getElementById('email').value.trim();
            const pUsuario = document.getElementById('p-usuario').value.trim();
            const pPassword = document.getElementById('p-password').value;

            // Validamos el email (si se ingresó).
            if (email && !regexEmail.test(email)) {
                alert('Error: El formato del correo electrónico no es válido.');
                return;
            }
            // Validamos que usuario y contraseña no estén vacíos.
            if (!pUsuario || !pPassword) {
                 alert('Error: El Usuario y la Contraseña son obligatorios para el paciente.');
                 return;
            }
            
            // Creamos el objeto 'nuevoPaciente' con todos sus datos.
            const nuevoPaciente = {
                nombre: nombre, ci: ci, telefono: telefono,
                edad: document.getElementById('edad').value,
                email: email,
                alergias: document.getElementById('alergias').value,
                usuario: pUsuario,
                password: pPassword
            };
            
            // Cargamos la lista actual de pacientes.
            let pacientes = JSON.parse(localStorage.getItem('pacientes_lista')) || [];
            
            // Verificamos duplicados (CI y Usuario).
            if (pacientes.some(p => p.ci === ci)) {
                alert('Error: Ya existe un paciente con esa Cédula (CI).');
                return;
            }
            if (pacientes.some(p => p.usuario === pUsuario)) {
                alert('Error: Ese nombre de usuario ya está en uso por otro paciente.');
                return;
            }
            
            // Añadimos el nuevo paciente a la lista.
            pacientes.push(nuevoPaciente);
            // Guardamos la lista actualizada en localStorage.
            localStorage.setItem('pacientes_lista', JSON.stringify(pacientes));

        } else if (rol === 'doctor') {
            // Obtenemos los valores de los campos específicos del doctor.
            const dUsuario = document.getElementById('usuario').value.trim();
            const dPassword = document.getElementById('password').value;
            
            // Creamos el objeto 'nuevoDoctor'.
            const nuevoDoctor = {
                nombre: nombre, ci: ci, telefono: telefono,
                usuario: dUsuario,
                password: dPassword,
                rol: 'doctor' // Guardamos el rol explícitamente.
            };

            // Cargamos la lista actual de doctores.
            let doctores = JSON.parse(localStorage.getItem('doctores_lista')) || [];
            
            // Verificamos si el nombre de usuario ya está en uso.
            if (doctores.some(d => d.usuario === nuevoDoctor.usuario)) {
                alert('Error: Ese nombre de usuario ya está en uso.');
                return;
            }
            
            // Añadimos el nuevo doctor a la lista.
            doctores.push(nuevoDoctor);
            // Guardamos la lista actualizada.
            localStorage.setItem('doctores_lista', JSON.stringify(doctores));
        }

        // --- 4.7. Mensaje final y redirección ---
        alert('¡Usuario agregado exitosamente!');
        // Enviamos al admin de vuelta a su panel principal.
        window.location.href = 'admin.html';
    });
});