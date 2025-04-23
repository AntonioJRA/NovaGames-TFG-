"use strict"

import { Router } from 'express';
import { getAllGames, getGame, getGamesByFilter,  getGamesByUser, getRandomGames } from '../controllers/games.controllers.js';
import { autenticarToken } from '../controllers/auth.controllers.js';


const router = Router();


router.get('/juegos', getAllGames);
router.get('/juegos/random', getRandomGames);
router.get('/juegos/filtros', getGamesByFilter);
router.get('/juegos/usuario', autenticarToken, getGamesByUser);
router.get('/juegos/:id', getGame);

export { router as routesGames };
