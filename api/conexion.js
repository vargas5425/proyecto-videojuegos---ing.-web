let phpAdmin = require("mysql");

let conexion = phpAdmin.createConnection({
    host:"localHost",
    port:3307,
    database: "videojuegos",
    user: "root",
    password:""
});

conexion.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log("conexion exitosa");
    }
});

module.exports = conexion;

//conexion.end();