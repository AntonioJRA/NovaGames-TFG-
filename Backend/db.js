"use strict";
import mysql from "mysql2/promise";
import { DB_HOST, DB_NAME, DB_PASS, DB_USER } from "./config.js";

//configurar un pool de conexiones con MYSQL
export const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,    //espera a la conexión si todas están ocupadas
    connectionLimit: 10, //num de conexiones máx de conexiones simultáneas
    queueLimit: 0   //límite para la cola de solicitudes (0 es ilimitadas)
});

//verificar si la conexión es exitosa
(async()=>{
    try {
        //intentar crear una conexión
        const connection= await pool.getConnection();
        console.log("Conexión con MySQL establecida correctamente");
        //liberar la conexión
        connection.release();
    } catch (error) {
        console.log(`Error al conectar con MySQL ${error.message}`);
    }
})()