document.addEventListener('DOMContentLoaded', () => {
    const registrarPedidoButton = document.getElementById('checkout');

    registrarPedidoButton.addEventListener('click', () => {
        if (!isAuthenticated()) {

            window.location.href = 'login.html'; 
        } else {
            
            guardarPedido();
        }
    });
});

function isAuthenticated() {
    let userId = localStorage.getItem('userId');
    
    if (userId) {
        console.log("El usuario está autenticado: " + userId);
        return true; 
    } else {
        console.log("El usuario no está autenticado.");
        return false; 
    }
}

function guardarPedido() {
    const userId = localStorage.getItem('userId');
    let url = 'http://localhost:4000/api/carrito';

    if (!userId) {
        alert("No estás autenticado. Por favor, inicia sesión para registrar un pedido.");
        window.location.href = 'login.html';
        return;
    } else {
        url += `?cliente_id=${userId}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el carrito');
            }
            return response.json();
        })
        .then(carrito => {
            if (carrito.length === 0) {
                alert("Tu carrito está vacío. Por favor, agrega productos antes de registrar un pedido.");
                return;
            }

            const confirmacion = confirm("¿Estás seguro de que deseas registrar el pedido? Una vez registrado, no podrás editarlo.");

            if (!confirmacion) {
                
                alert("El registro del pedido ha sido cancelado.");
                return;
            }

            const pedidoData = {
                userId: userId,
                productos: carrito,
            };

            return fetch('http://localhost:4000/api/registrarPedido', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedidoData),
            });
        })
        .then(response => {
           
            return response.json();
        })
        .then(data => {
            console.log("Pedido registrado exitosamente:", data);
            alert(data.alerta);  
            alert(data.mensaje);
            localStorage.removeItem('carrito'); 
        })
        .catch(error => {
            console.error("Error:", error);
           
        });
}
