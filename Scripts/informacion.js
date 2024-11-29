
          const urlParams = new URLSearchParams(window.location.search);
          const id = urlParams.get('id');
          
          fetch(`http://localhost:4000/api/juegos/${id}`)
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Error en la petición');
                  }
                  return response.json();
              })
              .then(data => {
                  const imageContainer = document.getElementById('image-container');
                  const textContainer = document.getElementById('text-container');
                  const descriptionContainer = document.getElementById('description-container');
          
                  imageContainer.innerHTML = '';
                  textContainer.innerHTML = '';
                  descriptionContainer.innerHTML = '';
          
                  const imgElement = document.createElement('img');
                  imgElement.src = data.imagen;
                  imgElement.alt = data.nombre_juego;
                  imgElement.classList.add('img');
          
                  const buttonElement = document.createElement('button');
                  buttonElement.textContent = 'Volver';
                  buttonElement.classList.add('button');
                  buttonElement.addEventListener('click', goBack);
          
                  const buyButton = document.createElement('button');
                  buyButton.classList.add('button');
                  buyButton.innerHTML = `Comprar - ${data.Precio.toFixed(2)} BS`; 
          
                  
                  const juegoFiltrado = {
                      id: data.id,
                      nombre_juego: data.nombre_juego,
                      imagen: data.imagen,
                      precio: data.Precio
                  };
          
                  
                  buyButton.addEventListener('click', () => {
                      agregarCarrito(juegoFiltrado);
                  });
          
                  imageContainer.appendChild(imgElement);
                  imageContainer.appendChild(buttonElement);
                  imageContainer.appendChild(buyButton);
          
                  const detallesArray = data.detalles.split('.');
                  detallesArray.forEach(detalle => {
                      const detalleItem = document.createElement('p');
                      detalleItem.textContent = detalle.trim();
                      descriptionContainer.appendChild(detalleItem);
                  });
          
                  const descElement = document.createElement('p');
                  descElement.textContent = 'Descripción:';
          
                  const descText = document.createElement('p');
                  descText.textContent = data.descripcion;
          
                  textContainer.appendChild(descElement);
                  textContainer.appendChild(descText);
              })
              .catch(error => {
                  console.error('Error al obtener la descripción:', error);
              });

             
             



            