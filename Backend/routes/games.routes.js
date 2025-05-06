"use strict"

import { Router } from 'express';
import { addGame, deleteGame, getAllGames, getAllUserGames, getGame, getGamesByFilter, getMostRatedGamesLimit, getMostRecentGamesLimit, getRandomGames, getSearchedGames, publicGame, updateGameRatings } from '../controllers/games.controllers.js';
import { autenticarToken } from '../controllers/auth.controllers.js';
import { validateGamesByFilter, validateUpdateRatings } from '../validators/games.validators.js';


const router = Router();

// get all + count
router.get('/juegos', getAllGames);
// get all by user
router.get('/juegos/usuario', autenticarToken, getAllUserGames);
// get random limit 30
router.get('/juegos/random', getRandomGames);
// get all by filter (category, rating, time) + count
router.get('/juegos/filtros', validateGamesByFilter, getGamesByFilter);
// get all by include (buscador)
router.get('/juegos/buscador', getSearchedGames);
// get games Limit 10, order Rating (si hay empate, random)
router.get('/inicio/juegos/valoracion', getMostRatedGamesLimit);
// get games Limit 10, order Upload_Date
router.get('/inicio/juegos/recientes', getMostRecentGamesLimit);
// get 1 by id
router.get('/juegos/:id', getGame);
// post 1 with title (crear seccion juego)
router.post('/juegos/crear', autenticarToken, addGame);
// update 1 is_open=true (publicar)
router.put('/juegos/publicar', publicGame);
// update rating_count y rating_sum
router.put('/juegos/actualizar-ratings', validateUpdateRatings, updateGameRatings);
// delete 1
router.delete('/juegos/eliminar/:idGame', deleteGame);


export { router as routesGames };
