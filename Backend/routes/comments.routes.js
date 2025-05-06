"use strict"

import { Router } from 'express';
import { getCommentsFromGame, getCommentsFromPost } from '../controllers/comments.controllers.js';


const router = Router();

// get all comments and all users by game_id
router.get('/comentarios/juegos', getCommentsFromGame);
// get all comments and all users by post_id
router.get('/comentarios/publicaciones', getCommentsFromPost);



export { router as routesComments };
