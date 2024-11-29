

document.getElementById('categoria-admin').addEventListener('change', async function () {
    const categoriaSeleccionada = this.value;
    await cargarJuegos(categoriaSeleccionada);
});
async function cargarJuegos(categoria = '') {
    try {

        const url = `http://localhost:4000/api/admin/juegos?categoria=${categoria}`;
        const response = await fetch(url);


        const juegos = await response.json();

        const tablaBody = document.querySelector('#tabla-juegos tbody');


        tablaBody.innerHTML = '';


        juegos.forEach(juego => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${juego.id}</td>
                <td class="des">${juego.nombre_juego}</td>
               
                <td><img src="/imagenesTemp/${juego.imagen}" alt="${juego.nombre_juego}" width="50"></td>
                <td>${juego.Precio} Bs</td>
                <td>${juego.Stock} Unidades</td>
                <td><button class="action-btn edit-btn"> Editar</button>
                <button class="action-btn delete-btn" onclick="eliminarJuego(${juego.id})">Eliminar</button></td>
            `;
            tablaBody.appendChild(fila);
        });
    } catch (error) {
        console.error(error);
    }
}

document.querySelector('.add-product-btn').addEventListener('click', () => {
    
    document.querySelector('.vista').style.display = 'none';

   
    const formulario = document.createElement('div');
    formulario.innerHTML = `
        <form id="form-agregar-producto">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" required>
            <label for="descripcion">Descripción:</label>
            <textarea id="descripcion" required></textarea>
            <label for="precio">Precio:</label>
            <input type="number" id="precio" step="any" required>
            <label for="imagen">Imagen:</label>
            <input type="file" id="imagen" accept="image/*" required>
            <label for="stock">stock:</label>
            <input type="text" id="stock" required>
            <label for="categoria">Categoría:</label>
            <select id="categoria" required>
                <option value="1">PS3</option>
                <option value="2">PS4</option>
                <option value="3">Xbox</option>
                <option value="4">PC</option>
            </select>
            <button type="submit">Guardar</button>
            <button type="button" id="cancelar">Cancelar</button>
        </form>
    `;
    document.body.appendChild(formulario);

    document.getElementById('form-agregar-producto').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nombre_juego', document.getElementById('nombre').value.trim());
        formData.append('descripcion', document.getElementById('descripcion').value.trim());
        formData.append('precio', parseFloat(document.getElementById('precio').value));
        formData.append('categoria', document.getElementById('categoria').value.trim());
        formData.append('stock', parseInt(document.getElementById('stock').value));

       
        const imagenInput = document.getElementById('imagen');
        formData.append('imagen', imagenInput.files[0]); 

        
        if (isNaN(formData.get('precio')) || isNaN(formData.get('stock'))) {
            alert('El precio debe ser un número decimal y el stock un número entero.');
            return;
        }

        try {
            const response = await fetch('http://localhost:4000/api/juegos', {
                method: 'POST',
                body: formData 
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al guardar el producto:', errorData);
                alert('Error al guardar el producto: ' + (errorData.error || 'Error desconocido.'));
                throw new Error('Error al guardar el producto');
            }


            cargarJuegos(); 
            document.body.removeChild(document.getElementById('form-agregar-producto').parentNode); 
            document.querySelector('.vista').style.display = 'block'; 
        } catch (error) {
            console.error(error);
        }
    });


    document.getElementById('cancelar').addEventListener('click', () => {
        document.body.removeChild(formulario); 
        document.querySelector('.vista').style.display = 'block'; 
    });
});

/*-----------------------------*/
document.getElementById('clientesButton').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:4000/api/admin/pedidos'); 
        if (!response.ok) {
            throw new Error('Error al obtener los pedidos');
        }
        const pedidos = await response.json();

        
        const tablaExistente = document.querySelector('#tabla-juegos');

        if (tablaExistente) {
            tablaExistente.style.display = 'none'; 
        }

        
        const nuevaTabla = document.createElement('table');
        nuevaTabla.id = 'tabla-juegos'; 
        nuevaTabla.innerHTML = `
            <thead>
                <tr>
                    <th>ID del Pedido</th>
                    <th>Fecha del Pedido</th>
                    <th>Nombre del Cliente</th>
                    <th>Total</th>
                    <th>Productos</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

       
        const contenedor = document.querySelector('.vista'); 
        contenedor.appendChild(nuevaTabla);

        
        const tablaBody = nuevaTabla.querySelector('tbody');
        pedidos.forEach(pedido => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${pedido.pedido_id}</td>
                <td>${pedido.fecha_pedido}</td>
                <td>${pedido.nombre_cliente}</td>
                <td>${pedido.total} Bs</td>
                <td>${pedido.productos}</td>
            `;
            tablaBody.appendChild(fila);

        });

    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        
        alert('Error al obtener los pedidos. Intente nuevamente más tarde.');
    }
});



/*----------------------------------*/

async function eliminarJuego(id) {
    try {
        const response = await fetch(`http://localhost:4000/api/juegos/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Error al eliminar el juego');
        }
        cargarJuegos(); 
    } catch (error) {
        console.error(error);
    }
}

/*-------------------------------------*/

document.querySelector('#tabla-juegos').addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-btn')) {
        
        const idJuego = e.target.closest('tr').querySelector('td').innerText;

        
        try {
            const response = await fetch(`http://localhost:4000/api/juegos/${idJuego}`);
            if (!response.ok) {
                throw new Error('Error al obtener el juego');
            }
            const juego = await response.json();

            
            document.querySelector('.vista').style.display = 'none';

            
            const formulario = document.createElement('div');
            formulario.innerHTML = `
                <form id="form-editar-producto">
                    <input type="hidden" id="id-juego" value="${juego.id}">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" value="${juego.nombre_juego}" required>
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" required>${juego.descripcion}</textarea>
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" step="any" value="${juego.Precio}" required>
                    <label for="stock">Stock:</label>
                    <input type="text" id="stock" value="${juego.Stock}" required>
                    <label for="categoria">Categoría:</label>
                    <select id="categoria" required>
                        <option value="1" ${juego.categoria === '1' ? 'selected' : ''}>PS3</option>
                        <option value="2" ${juego.categoria === '2' ? 'selected' : ''}>PS4</option>
                        <option value="3" ${juego.categoria === '3' ? 'selected' : ''}>Xbox</option>
                        <option value="4" ${juego.categoria === '4' ? 'selected' : ''}>PC</option>
                    </select>
                    <button type="submit">Actualizar</button>
                    <button type="button" id="cancelar">Cancelar</button>
                </form>
            `;
            document.body.appendChild(formulario);

            document.getElementById('form-editar-producto').addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData();
                formData.append('id_juego', document.getElementById('id-juego').value);
                formData.append('nombre_juego', document.getElementById('nombre').value.trim());
                formData.append('descripcion', document.getElementById('descripcion').value.trim());
                formData.append('precio', parseFloat(document.getElementById('precio').value));
                formData.append('categoria', document.getElementById('categoria').value.trim());
                formData.append('stock', parseInt(document.getElementById('stock').value));

                /*const imagenInput = document.getElementById('imagen');
                // Solo agregar imagen al FormData si se ha seleccionado una nueva
                if (imagenInput.files[0]) {
                    formData.append('imagen', imagenInput.files[0]);
                }*/

                try {
                    const response = await fetch(`http://localhost:4000/api/juegos/${juego.id}`, {
                        method: 'PUT',
                        body: formData
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error al actualizar el producto:', errorData);
                        alert('Error al actualizar el producto: ' + (errorData.error || 'Error desconocido.'));
                        throw new Error('Error al actualizar el producto');
                    }

                    cargarJuegos(); 
                    document.body.removeChild(formulario); 
                    document.querySelector('.vista').style.display = 'block'; 
                } catch (error) {
                    console.error(error);
                }
            });

            
            document.getElementById('cancelar').addEventListener('click', () => {
                document.body.removeChild(formulario); 
                document.querySelector('.vista').style.display = 'block';
            });
        } catch (error) {
            console.error('Error al obtener los datos del juego:', error);
        }
    }
});


/*----------------------------------------------*/

document.addEventListener('DOMContentLoaded', () => {
    cargarJuegos();
});


//<label for="imagen">Imagen:</label>
//<input type="file" id="imagen" accept="image/*"></input>
