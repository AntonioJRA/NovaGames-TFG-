"use strict"

import { Router } from 'express';
import { getGameCategories, getContentBlocks, updateSectionGame } from '../controllers/sectiongames.controllers.js';

const router = Router();

// get content blocks by id
router.get('/api/seccion-juego/contenido/:id', getContentBlocks);
// get categories by id
router.get('/api/seccion-juego/categorias/:id', getGameCategories);
// update 1 (guardar cambios)
router.patch('/api/seccion-juego/guardar', updateSectionGame);


export { router as routesSectionGames };
