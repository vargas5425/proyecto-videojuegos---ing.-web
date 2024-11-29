
const userId = localStorage.getItem('userId');
let totalItemsInCart = parseInt(localStorage.getItem('totalItemsInCart')) || 0;


async function agregarCarrito(product) {
    totalItemsInCart += 1;
    actualizarContenido();

    localStorage.setItem('totalItemsInCart', totalItemsInCart);

    
    const carritoData = {
        id: product.id,
        nombre_juego: product.nombre_juego,
        imagen: product.imagen,
        precio: product.precio,
        cantidad: product.cantidad,
        subtotal: product.subtotal,
        cliente_id: userId || null 
    };

    try {
 
        const response = await fetch('http://localhost:4000/api/carrito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carritoData)
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            loadCart();
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.error);
        }
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
    }
}

function actualizarContenido() {
    const cartCount = document.getElementById('cuenta-carrito');
    if (cartCount) {
        cartCount.textContent = totalItemsInCart;
    }
}

async function obtenerJuegoPorId(id) {
    try {
        const response = await fetch(`http://localhost:4000/api/juegos/${id}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        const juego = await response.json();

        const juegoFiltrado = {
            id: juego.id,
            nombre_juego: juego.nombre_juego,
            imagen: juego.imagen,
            precio: juego.Precio,
            cantidad: 1,
            subtotal: juego.Precio * 1
        };

        return juegoFiltrado;
    } catch (error) {
        console.error('Error al obtener el juego:', error);
    }
}


const urlActual = window.location.href;
const url = new URL(urlActual);
const idJuego = url.searchParams.get('id');

if (idJuego) {
    obtenerJuegoPorId(idJuego).then(juegoFiltrado => {
        console.log('Datos del juego filtrado:', juegoFiltrado);
    });
}


actualizarContenido();


window.agregarCarrito = agregarCarrito;

/*---------------------------------------------------*/

//panel carrito
document.getElementById('cars').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('cart-panel').style.right = '0';
});

document.getElementById('close-cart').addEventListener('click', () => {
    document.getElementById('cart-panel').style.right = '-100%';
});


function loadCart() {
    let url = 'http://localhost:4000/api/carrito';

    if (userId) {
        url += `?cliente_id=${userId}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(cartItems => {
            const cartContainer = document.getElementById('cart-items');
            cartContainer.innerHTML = '';

            let total = 0;
            cartItems.forEach(item => {
                const cartItemElement = document.createElement('div');
                cartItemElement.classList.add('cart-item');

               
                cartItemElement.innerHTML = `
                    <img src="${item.imagen_juego}" alt="${item.nombre_juego}">
                    <div>
                        <h4>${item.nombre_juego}</h4>
                        <input type="number" value="${item.cantidad}" min="1" 
                            onchange="updateCartItem(${item.producto_id}, this.value)">
                        <p>Subtotal: ${item.subtotal} Bs</p>
                    </div>
                    <div class="borrar">
                        <img class="img-carrito" src="/imagenes/eliminar.png" onclick="removeFromCart(${item.producto_id})" alt="Eliminar">
                    </div>
                `;

                cartContainer.appendChild(cartItemElement);
                total += item.precio * item.cantidad;
            });

            // Mostrar el total con la tarifa de servicio
            //document.getElementById('service-fee').textContent = (total * 0.1).toFixed(2) + ' Bs';
            document.getElementById('cart-total').textContent = (total).toFixed(2) + ' Bs';
        })
        .catch(error => console.error('Error fetching cart data:', error));
}


function updateCartItem(producto_id, nuevaCantidad) {
    const cliente_id = userId || null;

    fetch(`http://localhost:4000/api/carrito/${producto_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cantidad: nuevaCantidad, cliente_id: cliente_id })
    })
    .then(response => {
        if (response.ok) {
            loadCart();
        } else {
            console.error('Error updating item quantity');
        }
    })
    .catch(error => console.error('Error updating cart item:', error));
}


function removeFromCart(producto_id) {
    let url = `http://localhost:4000/api/carrito/${producto_id}`;
    if (userId) {
        url += `?cliente_id=${userId}`;
    }

    fetch(url, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadCart();
            updateProductStock(producto_id);
        } else {
            console.error('Error removing item from cart');
        }
    })
    .catch(error => console.error('Error removing cart item:', error));
}


window.onload = loadCart;

