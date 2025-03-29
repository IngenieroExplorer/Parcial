document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('formulario_login');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('correo').value.trim();
        const password = document.getElementById('contrasena').value.trim();

        if (!validateEmail(email) || !validatePassword(password)) {
            return;
        }

        iniciarSesion(email, password);
    });

    function validateEmail(email) {
        const emailError = document.querySelector('.error-correo');

        if (!email) {
            emailError.textContent = 'Por favor, ingresa tu correo';
            return false;
        }

        emailError.textContent = '';
        return true;
    }

    function validatePassword(password) {
        const passwordError = document.querySelector('.error-contrasena');

        if (!password) {
            passwordError.textContent = 'Debes ingresar tu contraseña';
            return false;
        }

        passwordError.textContent = '';
        return true;
    }

    function iniciarSesion(email, password) {
        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, clave: password })
        })
            .then(response => response.json())
            .then(data => {
                if (data.exito) {
                    localStorage.setItem('userId', data.usuario_id);
                    localStorage.setItem('isLoggedIn', 'true');
                    window.location.href = 'panel.html';
                }
            })
            .catch((error) => {
                console.log(error)
            });
    }
});
