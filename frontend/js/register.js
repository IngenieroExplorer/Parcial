document.addEventListener("DOMContentLoaded", function () {
    const formRegistro = document.getElementById("formularioRegistro");
    const mensajeDiv = document.querySelector(".mensaje");

    if (!formRegistro) return;

    formRegistro.addEventListener("submit", function (e) {
        e.preventDefault();

        const usuario = obtenerDatosFormulario();
        if (!usuario) return;

        enviarRegistro(usuario);
    });

    function obtenerDatosFormulario() {
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const contrasena = document.getElementById("contrasena").value.trim();
        const confirmacion = document.getElementById("confirmar_contrasena").value.trim();
    
        if (!nombre) return mostrarError("error-nombre", "El nombre es obligatorio");
        if (!correo) return mostrarError("error-correo", "El correo es obligatorio");
        if (!contrasena) return mostrarError("error-contrasena", "La contraseña es obligatoria");
        if (contrasena !== confirmacion) return mostrarError("error-confirmacion", "Las contraseñas no coinciden");
    
        limpiarErrores();
        return { nombre, correo, contrasena };
    }
    
    function mostrarError(clase, mensaje) {
        document.querySelector(`.${clase}`).textContent = mensaje;
    }
    
    function limpiarErrores() {
        document.querySelectorAll(".error-nombre, .error-correo, .error-contrasena, .error-confirmacion")
            .forEach(el => el.textContent = "");
    }

    function enviarRegistro(usuario) {
        fetch("http://localhost:5000/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "nombre_completo": usuario.nombre,
                "email": usuario.correo,
                "clave": usuario.contrasena
            }),
        })
            .then((respuesta) => respuesta.json())
            .then((datos) => manejarRespuesta(datos))
            .catch(() => mostrarMensaje("Error al conectar con el servidor", "error"));
    }

    function manejarRespuesta(datos) {
        if (datos.exito) {
            mostrarMensaje(datos.mensaje, "success");
            setTimeout(() => (window.location.href = "index.html"), 1500);
        } else {
            mostrarMensaje(datos.mensaje, "error");
        }
    }

    function mostrarMensaje(texto, tipo) {
        mensajeDiv.textContent = texto;
        mensajeDiv.className = `mensaje alert alert-${tipo === "error" ? "danger" : "success"}`;

        setTimeout(() => {
            mensajeDiv.textContent = "";
            mensajeDiv.className = "mensaje";
        }, 3000);
    }
});