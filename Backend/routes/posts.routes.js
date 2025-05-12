"use strict"

import { Router } from 'express';
import { addPost, getAllPosts, getPost } from '../controllers/posts.controllers.js';
import { autenticarToken } from '../controllers/auth.controllers.js';

const router = Router();

// get all by game_id order by post_date
router.get('/api/publicaciones', getAllPosts);
// get all by game_id order by post_date
router.get('/api/publicaciones/:id', getPost);
// post 1
router.post('/api/publicaciones/crear', autenticarToken, addPost);


export { router as routesPosts };
