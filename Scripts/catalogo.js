const urlParams=new URLSearchParams(window.location.search);
        const Categoria=urlParams.get('categoria');

        if (!Categoria) {
        console.error('La categoría no está definida en la URL');
      
        document.getElementById('games-container').innerHTML = '<p>Error: No se ha definido la categoría.</p>';
    } else {
        
        fetch(`http://localhost:4000/api/juegos?categoria=${Categoria}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Error en la petición');
            }
            return response.json();
          })
          .then(data => {
            const gamesContainer = document.getElementById('games-container');

            gamesContainer.innerHTML='';

            data.forEach(game => {
              
              const gameElement = document.createElement('div');
              gameElement.classList.add('productos');

              
              const imgElement = document.createElement('img');
              imgElement.src = game.imagen;
              imgElement.alt = game.nombre;
              imgElement.classList.add('img');

              const nameElement = document.createElement('p');
              nameElement.textContent = game.nombre_juego;

                const buttonElement=document.createElement('button');
                buttonElement.textContent='Informacion';
                buttonElement.classList.add('button-informacion');

                const buttonElement2=document.createElement('button');
                buttonElement2.classList.add('button-atras');
                buttonElement2.textContent = game.Precio.toFixed(2) +' Bs';

              

              gameElement.appendChild(imgElement);
              gameElement.appendChild(nameElement);
              gameElement.appendChild(buttonElement);
              gameElement.appendChild(buttonElement2);

              buttonElement.addEventListener('click', () => {
                window.location.href = `informacion.html?id=${game.id}`;
              });

              buttonElement2.addEventListener('click', () => {
                window.location.href = `informacion.html?id=${game.id}`;
              });


              gamesContainer.appendChild(gameElement);
            });
          })
          .catch(error => {
            console.error('Error al obtener los juegos:', error);
          });
        }