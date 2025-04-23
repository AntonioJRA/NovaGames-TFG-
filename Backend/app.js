"use strict";
//Importar el paquete express
import express from 'express';
import cors from 'cors';
import nodeCron from 'node-cron'; 
import { routerAuth } from './routes/auth.routes.js';
import { PORT } from './config.js';
import { pool } from './db.js';
import { routesUsers } from './routes/users.routes.js';
import { routesGames } from './routes/games.routes.js';



//crear una aplicación express
const app=express();

//establecer cors (normas de navegadores que bloquean peticiones de otros dominios)
app.use(cors());

//para parsear la petición al usuario
app.use(express.json());

//ruta de autenticación
app.use(routerAuth);

//usar rutas directas
app.use(routesUsers);
app.use(routesGames);

// Cron job para eliminar usuarios no verificados después de una semana
// nodeCron.schedule('* * * * *', async () => {     // un minuto
nodeCron.schedule('0 0 * * *', async () => {    // una semana
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Fecha de hace una semana
    try {
        const [result] = await pool.query(`
            DELETE FROM users 
            WHERE is_verified = false AND registration_date < ?
        `, [oneWeekAgo]);

        console.log(`Usuarios no verificados eliminados: ${result.affectedRows}`);
    } catch (error) {
        console.error('Error al eliminar usuarios no verificados:', error);
    }
});

//ruta principal
app.get('/',(req,res)=>{
    res.end("Hello world from Node.js Server")
})

//manejar rutas no encontradas (404)
app.use((req,res)=>{
    res.status(404).send("Wrong page!!!");
})

app.listen(PORT,()=>{
    console.log(`Server running in URL http://localhost:${PORT}`);
})