"use strict"

import { Router } from 'express';
import { addGame, getAllGames, getGame, getGamesByFilter,  getGamesByUser, getMostRatedGamesLimit, getMostRecentGamesLimit, getRandomGames } from '../controllers/games.controllers.js';
import { autenticarToken } from '../controllers/auth.controllers.js';


const router = Router();

// Obtener todos los juegos
router.get('/juegos', getAllGames);
// Obtener 30 juegos aleatoriamente
router.get('/juegos/random', getRandomGames);
// Filtrar los juegos 
router.get('/juegos/filtros', getGamesByFilter);
// Juegos del usuario
router.get('/juegos/usuario', autenticarToken, getGamesByUser);
// 10 juegos mejor valorados. En caso de empate, habrá aleatoriedad entre ellos
router.get('/inicio/juegos/valoracion', getMostRatedGamesLimit);
// 10 juegos más recientes
router.get('/inicio/juegos/recientes', getMostRecentGamesLimit);
// Obtener un juego
router.get('/juegos/:id', getGame);
// Subir un juego
router.post('juegos/subir', autenticarToken, addGame);


export { router as routesGames };
