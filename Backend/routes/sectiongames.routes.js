"use strict"

import { Router } from 'express';
import { getCategories, updateSectionGame } from '../controllers/sectiongames.controllers.js';

const router = Router();

// get all categories (buscador include)
router.get('/api/categorias', getCategories);
// update 1 (guardar cambios)
router.patch('/api/juegos/guardar', updateSectionGame);


export { router as routesSectionGames };
