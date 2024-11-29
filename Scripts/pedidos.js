
document.addEventListener('DOMContentLoaded', () => {
    const pedidoLista = document.getElementById('pedido-lista');

    function cargarPedidos() {
        const userId = localStorage.getItem('userId');
        let url = 'http://localhost:4000/api/pedidos';

        if (!userId) {
            alert("Por favor, inicia sesión para ver tus pedidos.");
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
        .then(pedidos => {
            if (pedidos.length === 0) {
                alert("No tienes pedidos");
                return;
            }
          
            

                pedidoLista.innerHTML = '';

                let totalGeneral = 0;

                pedidos.forEach(pedido => {
                    totalGeneral += parseFloat(pedido.subtotal);
                    
                    const pedidoHTML = `
                    <div class="informacion-pedido">
                        <div class="pedido">
                            <p>Fecha: ${pedido.fecha_pedido}</p>
                            <img src="${pedido.imagen_juego}" alt="${pedido.nombre_juego}" class="imagen-juego">
                            <p>${pedido.nombre_juego}</p>
                            <p>SubTotal: ${pedido.precio} Bs x ${pedido.cantidad} = ${pedido.subtotal} Bs</p>
                            
                        </div>
                    </div>
                    `;
                    pedidoLista.innerHTML += pedidoHTML;
                });

                const totalHTML = `<div class="border"><p class="total-final">Total a Pagar: ${totalGeneral.toFixed(2)} Bs</p></div>`;
                pedidoLista.innerHTML += totalHTML;

                // Agregar eventos a los botones de eliminar
               /* const botonesEliminar = document.querySelectorAll('.button-eliminar');
                botonesEliminar.forEach(boton => {
                    boton.addEventListener('click', eliminarProducto);
                });*/
            })
            .catch(error => {
                alert("NO TIENES PEDIDOS REGISTRADOS:",error);
                pedidoLista.innerHTML = '<p>NO TIENES PEDIDOS REGISTRADOS.</p>';
            });
    }

    cargarPedidos();
});

