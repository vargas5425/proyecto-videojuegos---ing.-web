const express = require('express');
const cors = require('cors'); 
const conexion = require('./conexion');
const app = express();
const multer = require('multer');
const path = require('path');

app.use(cors({
    origin: 'http://127.0.0.1:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/imagenesTemp', express.static('imagenesTemp'));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'imagenesTemp/'); 
    },
    filename: function (req, file, cb) {
      
      const ext = path.extname(file.originalname);  
      const filename = Date.now() + ext;  // Usamos el timestamp + la extensión
      cb(null, filename);  
    }
  });

const upload = multer({ storage: storage });

/*------------------------METODOS GET------------------------------------------------------*/

app.get('/api/juegos/:id', (req, res) => {
    const juegoId = req.params.id;
    conexion.query("SELECT * FROM juegos WHERE id = ?", [juegoId], (err, results) => {
        if (err) {
            console.error("Error al realizar la consulta:", err.stack);
            return res.status(500).send("Error en la base de datos");
        }
        if (results.length > 0) {
            results.forEach(result => {
                result.imagen = `http://127.0.0.1:3000/imagenesTemp/${result.imagen} `;
              });
            res.json(results[0]); 
        } else {
            res.status(404).send("Juego no encontrado");
        }
        
    });
});

/*-----------------------------------------------------------------------------------*/

app.get('/api/admin/juegos', (req, res) => {
    
    const categoria = req.query.categoria;
    const consulta = categoria 
        ? "SELECT id, nombre_juego, imagen, Precio, Stock FROM juegos WHERE categoria = ?"
        : "SELECT id, nombre_juego, imagen, Precio, Stock FROM juegos"; 
         

    const queryParams = categoria ? [categoria] : [];

    conexion.query(consulta, queryParams, (err, results) => {
        if (err) {
            console.error("Error al realizar la consulta:", err.stack);
            return res.status(500).send("Error en la base de datos");
        }
        if (results.length > 0) {
           
            res.json(results); 
        } 
    });

    
});

/*-------------------------------------------------------------------------------------*/

app.get('/api/juegos', (req, res) => {
    const categoria = req.query.categoria;
  
    if (categoria) {
      // Consulta para obtener juegos por categoría
      const consultaCategoria = "SELECT id, nombre_juego, imagen, Precio, Stock FROM juegos WHERE categoria = ?";
      const queryParams = [categoria];
  
      conexion.query(consultaCategoria, queryParams, (err, results) => {
        if (err) {
          console.error("Error al realizar la consulta:", err.stack);
          return res.status(500).send("Error en la base de datos");
        }
        if (results.length > 0) {
          results.forEach(result => {
            result.imagen = `http://127.0.0.1:3000/imagenesTemp/${result.imagen} `;
          });
          res.json(results);
        } else {
          res.status(404).send("No se encontraron juegos para la categoría especificada");
        }
      });
    }  else {
          res.status(404).send("No se encontraron juegos");
        }
      });
    
  /*-------------------------------------------------------------------------------------*/

  app.get('/api/carrito', (req, res) => {
    
    const id_cliente = req.query.cliente_id || null;  

    let query = "SELECT producto_id, nombre_juego, imagen_juego, precio, cantidad, subtotal FROM carrito WHERE id_cliente IS NULL"; // Carrito anónimo
    let params = [];

    if (id_cliente) {
   
        query = "SELECT producto_id, nombre_juego, imagen_juego, precio, cantidad, subtotal FROM carrito WHERE id_cliente = ?";
        params = [id_cliente]; 
    }

    
    conexion.query(query, params, (err, results) => {
        if (err) {
            console.error("Error al obtener los productos del carrito:", err);
            return res.status(500).send("Error al obtener el carrito");
        }
        
        results.forEach(result => {
            result.imagen = `http://127.0.0.1:3000/imagenesTemp/${result.imagen}`;
        });
        res.json(results);
    });
});

/*-------------------------------------------------------------------------------------*/

app.get('/api/pedidos', (req, res) => {
    const cliente_id = req.query.cliente_id; 

    if (!cliente_id) {
        return res.status(400).json({ error: 'userId es necesario' });
    }

    const queryPedidos = `
        SELECT 
            pedidos.id, 
            pedidos.fecha_pedido, 
            pedidos.total, 
            detalle_pedido.nombre_juego, 
            detalle_pedido.precio, 
            detalle_pedido.subtotal,
            detalle_pedido.cantidad, 
            detalle_pedido.imagen_juego
        FROM pedidos
        INNER JOIN detalle_pedido ON pedidos.id = detalle_pedido.pedido_id
        WHERE pedidos.usuario_id = ?
    `;

    conexion.query(queryPedidos, [cliente_id], (err, results) => {
        if (err) {
            console.error('Error al obtener los pedidos:', err);
            return res.status(500).json({ error: 'Error al obtener los pedidos' });
        }

        if (results.length === 0) {
            
            return res.status(404).json({ message: 'No se encontraron pedidos para este usuario.' });
    
        }
        
        results.forEach(result => {
            result.imagen = `http://127.0.0.1:3000/imagenesTemp/${result.imagen}`;
        });
        res.json(results);
    });
});

/*-------------------------------------------------------------------------------------*/

app.get('/api/admin/pedidos', (req, res) => {
    const consultaPedidos = `
        SELECT 
    pedidos.id AS pedido_id,
    pedidos.fecha_pedido AS fecha_pedido,
    registro.nombre AS nombre_cliente,
    SUM(detalle_pedido.precio * detalle_pedido.cantidad) AS total,
    GROUP_CONCAT(detalle_pedido.nombre_juego SEPARATOR ', ') AS productos
FROM 
    pedidos
JOIN 
    registro ON pedidos.usuario_id = registro.id_cliente
JOIN 
    detalle_pedido ON pedidos.id = detalle_pedido.pedido_id
GROUP BY 
    pedidos.id, registro.id_cliente, pedidos.fecha_pedido;
    `;

    conexion.query(consultaPedidos, (err, results) => {
        if (err) {
            console.error("Error al realizar la consulta de pedidos:", err.stack);
            return res.status(500).send("Error en la base de datos");
        }
        res.json(results);
    });
});

/*----------------------------------METODOS POST---------------------------------------------------*/


app.post('/api/juegos', upload.single('imagen'), (req, res) => {
    const { nombre_juego, categoria, precio, descripcion, stock } = req.body;
    const imagen = req.file ? req.file.filename : null; 
  
   
    if (!nombre_juego || !imagen || !categoria || !precio || !descripcion || !stock) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
  
   
    const query = "INSERT INTO juegos (nombre_juego, imagen, categoria, Precio, descripcion, Stock) VALUES (?, ?, ?, ?, ?, ?)";
  
   
    conexion.query(query, [nombre_juego, imagen, categoria, precio, descripcion, stock], (err, result) => {
      if (err) {
        console.error("Error al insertar el juego:", err.stack);
        return res.status(500).send("Error en la base de datos");
      }
  
      res.status(201).json({ message: 'Juego creado correctamente.', id: result.insertId });
    });
  });

/*-------------------------------------------------------------------------------------*/

app.post('/api/login', (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const consultaLogin = "SELECT id_cliente, nombre, rol FROM registro WHERE correo = ? AND contraseña = ?";
    conexion.query(consultaLogin, [correo, contraseña], (err, result) => {
        if (err) {
            console.error("Error en la base de datos:", err);
            return res.status(500).json({ error: "Error al iniciar sesión." });
        }

        if (result.length === 0) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos." });
        }

        const { id_cliente, nombre, rol } = result[0];
        if (rol === 1) {
            res.status(200).json({ redirectTo: "administrador.html", id_cliente, nombre });
        } else {
            res.status(200).json({ redirectTo: "principal.html", id_cliente, nombre });
        }
    });
});

/*-------------------------------------------------------------------------------------*/

app.post('/api/registro', (req, res) => {
    const { nombre, correo, contraseña } = req.body;


    if (!nombre || !correo || !contraseña) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const consultaCorreo = "SELECT correo FROM registro WHERE correo = ?";
    conexion.query(consultaCorreo, [correo], (err, result) => {
        if (err) {
            console.error("Error en la base de datos:", err);
            return res.status(500).json({ error: "Error al verificar el correo." });
        }

        if (result.length > 0) {

            return res.status(400).json({ error: "Este correo ya está vinculado a una cuenta." });
        }

 
    const consulta = "INSERT INTO registro (nombre, correo, contraseña) VALUES (?, ?, ?)";
    conexion.query(consulta, [nombre, correo, contraseña], (err, result) => {
        if (err) {
            console.error("Error en la base de datos:", err);
            return res.status(500).json({ error: "Error al registrar el usuario." });
        }

        res.status(200).json({ message: "Usuario registrado con éxito." });
    });
    });
});

/*-------------------------------------------------------------------------------------*/

app.post('/api/carrito', (req, res) => {
    const { id, nombre_juego, imagen, precio, cliente_id } = req.body;

    
    if (!id || !nombre_juego || !imagen || !precio) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    if (cliente_id) {
        
        const checkQuery = 'SELECT * FROM carrito WHERE producto_id = ? AND id_cliente = ? ';
        const queryParams = [id, cliente_id];

        conexion.query(checkQuery, queryParams, (err, results) => {
            if (err) {
                console.error('Error al verificar producto:', err);
                return res.status(500).json({ error: 'Error al verificar producto en el carrito' });
            }

            if (results.length > 0) {
              
                const newQuantity = results[0].cantidad + 1; 
                const newSubtotal = newQuantity * precio; 

                const updateQuery = 'UPDATE carrito SET cantidad = ?, subtotal = ? WHERE producto_id = ? AND id_cliente = ? ';
                const updateParams = [newQuantity, newSubtotal, id, cliente_id];

                conexion.query(updateQuery, updateParams, (err, result) => {
                    if (err) {
                        console.error('Error al actualizar datos:', err);
                        return res.status(500).json({ error: 'Error al actualizar datos en el carrito' });
                    }

                    res.status(200).json({ message: 'Juego actualizado en el carrito' });
                });
            } else {
                
                const cantidad = 1; 
                const subtotal = precio; 
                const query = 'INSERT INTO carrito (producto_id, nombre_juego, imagen_juego, precio, cantidad, subtotal, id_cliente) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const insertParams = [id, nombre_juego, imagen, precio, cantidad, subtotal, cliente_id];

                conexion.query(query, insertParams, (err, result) => {
                    if (err) {
                        console.error('Error al insertar datos:', err);
                        return res.status(500).json({ error: 'Error al insertar datos en el carrito' });
                    }
                    res.status(201).json({ message: 'Juego agregado al carrito', id: result.insertId });
                });
            }
        });
    } else {
        
        const checkQuery = 'SELECT * FROM carrito WHERE producto_id = ? AND id_cliente IS NULL';
        const queryParams = [id];

        conexion.query(checkQuery, queryParams, (err, results) => {
            if (err) {
                console.error('Error al verificar producto:', err);
                return res.status(500).json({ error: 'Error al verificar producto en el carrito' });
            }

            if (results.length > 0) {
                
                const newQuantity = results[0].cantidad + 1; 
                const newSubtotal = newQuantity * precio; 

                const updateQuery = 'UPDATE carrito SET cantidad = ?, subtotal = ? WHERE producto_id = ? AND id_cliente IS NULL';
                const updateParams = [newQuantity, newSubtotal, id];

                conexion.query(updateQuery, updateParams, (err, result) => {
                    if (err) {
                        console.error('Error al actualizar datos:', err);
                        return res.status(500).json({ error: 'Error al actualizar datos en el carrito' });
                    }

                    res.status(200).json({ message: 'Juego actualizado en el carrito' });
                });
            } else {
               
                const cantidad = 1; 
                const subtotal = precio; 
                const query = 'INSERT INTO carrito (producto_id, nombre_juego, imagen_juego, precio, cantidad, subtotal, id_cliente) VALUES (?, ?, ?, ?, ?, ?, ?)';
                const insertParams = [id, nombre_juego, imagen, precio, cantidad, subtotal, null];

                conexion.query(query, insertParams, (err, result) => {
                    if (err) {
                        console.error('Error al insertar datos:', err);
                        return res.status(500).json({ error: 'Error al insertar datos en el carrito' });
                    }
                    res.status(201).json({ message: 'Juego agregado al carrito', id: result.insertId });
                });
            }
        });
    }
});

/*-------------------------------------------------------------------------------------*/

app.post('/api/registrarPedido', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).send("Falta el ID del usuario para registrar el pedido.");
    }

    const queryCarrito = "SELECT producto_id, nombre_juego, imagen_juego, precio, cantidad, subtotal FROM carrito WHERE id_cliente = ?";
    conexion.query(queryCarrito, [userId], (err, productos) => {
    if (err) {
        console.error("Error al obtener los productos del carrito:", err);
        return res.status(500).send("Error al obtener los productos del carrito");
    }

    if (productos.length === 0) {
        return res.status(400).send("El carrito está vacío.");
    }

    const total = productos.reduce((acc, producto) => acc + producto.subtotal, 0);

    const fecha_pedido = new Date();
    const estado = 'pendiente'; 

    const query = "INSERT INTO pedidos (usuario_id, fecha_pedido, estado, total) VALUES (?, ?, ?, ?)";
    conexion.query(query, [userId, fecha_pedido, estado, total], (err, result) => {
        if (err) {
            console.error("Error al registrar el pedido:", err);
            return res.status(500).send("Error al registrar el pedido");
        }

        const pedidoId = result.insertId;

        const queryDetalle = "INSERT INTO detalle_pedido (pedido_id, producto_id, nombre_juego, imagen_juego, precio, cantidad, subtotal) VALUES ?";
        const valoresDetalle = productos.map(producto => [pedidoId, producto.producto_id, producto.nombre_juego, producto.imagen_juego, producto.precio, producto.cantidad, producto.subtotal]);

        conexion.query(queryDetalle, [valoresDetalle], (err) => {
            if (err) {
                console.error("Error al registrar los detalles del pedido:", err);
                return res.status(500).send("Error al registrar los detalles del pedido");
            }

            const queryLimpiarCarrito = "DELETE FROM carrito WHERE id_cliente = ?";
            conexion.query(queryLimpiarCarrito, [userId], (err) => {
                if (err) {
                    console.error("Error al limpiar el carrito:", err);
                    return res.status(500).send("Error al limpiar el carrito");
                }
                
                res.status(201).json({
                    alerta: "Pedido registrado exitosamente.", pedidoId });
            });
        });
    });
});
});

/*-----------------------------METODOS PUT--------------------------------------------------------*/

app.put('/api/juegos/:id', upload.single('imagen'), async (req, res) => {
    const { id } = req.params;
    const { nombre_juego, descripcion, precio, categoria, stock } = req.body;

    
    let imagen = null;
    if (req.file) {
        imagen = req.file.path; 
    }

    try {
        
        if (imagen) {
            const result = await conexion.query(
                `UPDATE juegos SET nombre_juego = ?, descripcion = ?, Precio = ?, categoria = ?, Stock = ?, imagen = ? WHERE id = ?`,
                [nombre_juego, descripcion, precio, categoria, stock, imagen, id]
            );
            

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Juego no encontrado' });
            }
        } else {
            
            const result = await conexion.query(
                `UPDATE juegos SET nombre_juego = ?, descripcion = ?, Precio = ?, categoria = ?, Stock = ? WHERE id = ?`,
                [nombre_juego, descripcion, precio, categoria, stock, id]
            );
           

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Juego no encontrado' });
            }
        }

        res.status(200).json({ message: 'Juego actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el juego:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

/*-------------------------------------------------------------------------------------*/

app.put('/api/carrito/:producto_id', (req, res) => {
    const { producto_id } = req.params;
    const { cantidad, cliente_id } = req.body;

    const query = `
        UPDATE carrito 
        SET cantidad = ?, subtotal = precio * ? 
        WHERE producto_id = ? AND (id_cliente = ? OR (id_cliente IS NULL AND ? IS NULL))
    `;

    conexion.query(query, [cantidad, cantidad, producto_id, cliente_id, cliente_id], (err, results) => {
        if (err) {
            console.error("Error al actualizar el producto del carrito:", err);
            return res.status(500).send("Error al actualizar el carrito");
        }
        res.sendStatus(200);
    });
});

/*-------------------------METODOS DELETE------------------------------------------------------------*/

app.delete('/api/carrito/:producto_id', (req, res) => {
    const { producto_id } = req.params;
    const cliente_id = req.query.cliente_id;

    let query;
    let params;

    if (cliente_id) {
  
        query = `DELETE FROM carrito WHERE producto_id = ? AND id_cliente = ?`;
        params = [producto_id, cliente_id];
    } else {
 
        query = `DELETE FROM carrito WHERE producto_id = ? AND id_cliente IS NULL`;
        params = [producto_id];
    }

    conexion.query(query, params, (err, results) => {
        if (err) {
            console.error("Error al eliminar el producto del carrito:", err);
            return res.status(500).send("Error al eliminar el producto del carrito");
        }

        if (results.affectedRows === 0) {

            return res.status(404).send("No se encontró el producto en el carrito para eliminar");
        }

        res.sendStatus(200);
    });
});

/*-------------------------------------------------------------------------------------*/

app.delete('/api/juegos/:id', (req, res) => {
    const juegoId = req.params.id;
    conexion.query("DELETE FROM juegos WHERE id = ?", [juegoId], (err, results) => {
        if (err) {
            console.error("Error al realizar la consulta:", err.stack);
            return res.status(500).send({ error: "Error en la base de datos" });
        }
        if (results.affectedRows > 0) {
            res.status(200).send({ message: "Juego eliminado correctamente" });
        } else {
            res.status(404).send({ error: "Juego no encontrado" });
        }
    });
});

/*-------------------------------------------------------------------------------------*/

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
