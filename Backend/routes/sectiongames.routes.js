"use strict"

import { Router } from 'express';
import { getContentBlocks, updateSectionGame } from '../controllers/sectiongames.controllers.js';

const router = Router();

// update 1 (guardar cambios)
router.get('/api/seccion-juego/contenido/:id', getContentBlocks);
// update 1 (guardar cambios)
router.patch('/api/seccion-juego/guardar', updateSectionGame);


export { router as routesSectionGames };
