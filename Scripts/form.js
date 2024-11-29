
document.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);
    const formType = urlParams.get("form");

    const loginForm = document.getElementById("login-inicio");
    const registroForm = document.getElementById("login-registro");
    
    const inicioSesionLink = document.getElementById("inicio-sesion");
    const registrateLink = document.getElementById("registrate");
    const cerrarSesionBtn = document.getElementById("cerrar-sesion");

    const userId = localStorage.getItem('userId');
    if (userId) {
        
        cerrarSesionBtn.style.display = 'block'; 
        inicioSesionLink.style.display = 'none'; 
        registrateLink.style.display = 'none';
        
    } else {

        cerrarSesionBtn.style.display = 'none';
        inicioSesionLink.style.display = 'inline-block'; 
        registrateLink.style.display = 'inline-block'; 
        
    }

    if (loginForm && registroForm) {
        if (formType === "registro") {
            loginForm.style.display = "none";
            registroForm.style.display = "block";
        } else {
            loginForm.style.display = "block";
            registroForm.style.display = "none";
        }

        const formularioLogin = loginForm.querySelector("form");
        formularioLogin.addEventListener("submit", function(event) {
            event.preventDefault();

            const correo = formularioLogin.querySelector("input[name='name']").value.trim();
            const contraseña = formularioLogin.querySelector("input[name='password']").value.trim();

            if (!correo || !contraseña) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            const datos = { correo, contraseña };

            fetch(`http://localhost:4000/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            })
            .then(response => response.json())
            .then(resultado => {
                if (resultado.error) {
                    alert("Error: " + resultado.error);
                } else if (resultado.redirectTo) {
                    
                    localStorage.setItem('userId', resultado.id_cliente);
                    localStorage.setItem('userName', resultado.nombre);
                    localStorage.setItem('userRole', resultado.rol); 

                    window.location.href = resultado.redirectTo;
                }
            })
            .catch(error => {
                console.error("Error en el inicio de sesión:", error);
                alert("Hubo un problema al iniciar sesión. Inténtelo de nuevo.");
            });
        });

        const formularioRegistro = registroForm.querySelector("form");
        formularioRegistro.addEventListener("submit", function(event) {
            event.preventDefault();

            const nombre = formularioRegistro.querySelector("input[name='nombre']").value.trim();
            const correo = formularioRegistro.querySelector("input[name='correo']").value.trim();
            const contraseña = formularioRegistro.querySelector("input[name='contraseña']").value.trim();
            const confirmar = formularioRegistro.querySelector("input[name='confirmar']").value.trim();

            if (!nombre || !correo || !contraseña || !confirmar) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            if (contraseña !== confirmar) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            const datos = { nombre, correo, contraseña };

            fetch (`http://localhost:4000/api/registro`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            })
            .then(response => response.json())
            .then(resultado => {
                if (resultado.error) {
                    alert("Error: " + resultado.error);
                } else {
                    alert("Registro exitoso. Ahora puedes iniciar sesión.");
                    window.location.href = "login.html"; 
                }
            })
            .catch(error => {
                console.error("Error en el registro:", error);
                alert("Hubo un problema al registrarse. Inténtelo de nuevo.");
            });
        });
    } 
    else {
        console.error("No se encontraron los formularios");
    }
});


function cerrarSesion() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');

    localStorage.setItem('totalItemsInCart', 0);

    if (typeof window.actualizarContenido === 'function') {
        window.totalItemsInCart = 0; 
        window.actualizarContenido();
    }

    window.location.href = "login.html"; 
}

document.getElementById("cerrar-sesion").addEventListener("click", cerrarSesion);
