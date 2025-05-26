"use strict"

import { Router } from 'express';
import { getCategories } from '../controllers/categories.controllers.js';

const router = Router();

// get all categories (buscador include)
router.get('/api/categorias', getCategories);


export { router as routesCategories };
