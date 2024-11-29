
function fetchGameDescription(id) {
    fetch(`http://localhost:4000/api/juegos/${id}`) 
        .then(response =>  {
            if (!response.ok) {
                throw new Error('Error en la petición');
            }
            return response.json();
        })
        .then(data => {
            window.location.href = `informacion.html?id=${id}`;
        })
        .catch(error => {
            console.error('Error al obtener la descripción:', error);
        });
}
function fetchGames(categoria) {
    fetch(`http://localhost:4000/api/juegos/?categoria=${categoria}`) 
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la petición');
            }
            return response.json();
        })
        .then(data => {
   //esto cambie para que no salga los datos de los juegos del catalogo
           // localStorage.setItem('games', JSON.stringify(data));
           
            window.location.href = `catalogo.html?categoria=${categoria}`;
        })
        .catch(error => {
            console.error('Error al obtener los juegos:', error);
        });
}
function goBack() {

    if (window.history.length > 1) {
        window.history.back(); 
    } else {
        
        window.location.href = 'defaultPage.html'; 
    }
}

function verPedidos() {
  
    window.location.href = 'detalles_compra.html';
}