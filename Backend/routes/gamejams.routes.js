"use strict"

import { Router } from 'express';
import { getActiveGameJam, getGameJamLimit, getGamesFromGameJamLimit, getLastGameJamData, getLastGameJamGames, getSearchedGameFromJam } from '../controllers/gamejams.controllers.js';

const router = Router();

// get last Jam (winner banner)(gamejam info, winner user and game title)
router.get('/api/gamejams/ultima-jam', getLastGameJamData);
// get games from last Jam (Limit 10, order Rating, games del 2 al 11)
router.get('/api/gamejams/juegos-ultima-jam', getLastGameJamGames);
// get active gamejam
router.get('/api/gamejams/jam-activa', getActiveGameJam);
// get all (limit 5, order by end_date, is_open=false)(jams pasadas)
router.get('/api/gamejams/jam-limit', getGameJamLimit);
// get all games (buscador)
router.get('/api/gamejams/juegos-jam-buscador', getSearchedGameFromJam);
// get all games (buscador)
router.get('/api/gamejams/juegos-jam-limit', getGamesFromGameJamLimit);
// Game_jam participants post 1
router.get('/api/gamejams/participar/inscribirse', getGamesFromGameJamLimit);
// Game_jam participants delete 1
router.get('/api/gamejams/participar/abandonar', getGamesFromGameJamLimit);


export { router as routesGameJams };
