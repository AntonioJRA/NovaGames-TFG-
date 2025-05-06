"use strict"

import { Router } from 'express';
import { getAllPosts, getPost } from '../controllers/posts.controllers.js';

const router = Router();

// get all by game_id order by post_date
router.get('/publicaciones', getAllPosts);
// get all by game_id order by post_date
router.get('/publicaciones/:id', getPost);


export { router as routesPosts };
