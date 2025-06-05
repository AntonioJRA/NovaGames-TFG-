"use strict"

import { Router } from 'express';
import { addGame, addGameRating, deleteGame, getAllGames, getAllUserGames, getGame, getGameRatingByUser, getGamesByFilter, getLastGame, getMostRatedGamesLimit, getMostRecentGamesLimit, getRandomGames, publicGame, updateGameDownloads, updateGameRating } from '../controllers/games.controllers.js';
import { autenticarToken } from '../controllers/auth.controllers.js';
import { validateGamesByFilter, validateUpdateRatings } from '../validators/games.validators.js';


const router = Router();

// get all + count
router.get('/api/juegos', getAllGames);
// get last gane
router.get('/api/juegos/ultimo', getLastGame);
// get all by user
router.get('/api/juegos/usuario', autenticarToken, getAllUserGames);
// get random limit 30
router.get('/api/juegos/random', getRandomGames);
// get all by filter (category, rating, time) + count
router.get('/api/juegos/filtros', validateGamesByFilter, getGamesByFilter);
// get all by include (buscador)
// router.get('/api/juegos/buscador', getSearchedGames);
// get games Limit 10, order Rating (si hay empate, random)
router.get('/api/juegos/valoracion', getMostRatedGamesLimit);
// get games Limit 10, order Upload_Date
router.get('/api/juegos/recientes', getMostRecentGamesLimit);
// get rating by user
router.get('/api/juegos/rating-usuario', autenticarToken, getGameRatingByUser);
// get 1 by id
router.get('/api/juegos/:id', getGame);
// post 1 with title (crear seccion juego)
router.post('/api/juegos/crear', autenticarToken, addGame);
// post game_rating
router.post('/api/juegos/subir-rating', autenticarToken, addGameRating);
// update 1 is_open=true (publicar)
router.put('/api/juegos/publicar', publicGame);
// update game_rating
router.put('/api/juegos/actualizar-rating', autenticarToken, updateGameRating);
// update game_rating
router.put('/api/juegos/actualizar-descargas', updateGameDownloads);
// delete 1
router.delete('/api/juegos/eliminar/:idGame', deleteGame);


export { router as routesGames };
