"use strict"

import { Router } from 'express';
import { validar } from '../validators/users.validators.js';
import { autorizarRol, deleteUser, getAllUsers, getUser, updateProfile } from '../controllers/users.controllers.js';

const router = Router();


router.get('/usuarios', getAllUsers);
router.get('/usuarios/:id', getUser);
router.patch('/usuarios/:id', updateProfile);
router.delete('/usuarios/:id', autorizarRol(['admin']), deleteUser);


export { router as routesUsers };
