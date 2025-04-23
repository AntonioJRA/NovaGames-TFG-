"use strict"

import { Router } from 'express';
import { validar } from '../validators/users.validators.js';
import { getAllGames, getGame, getGamesByFilter,  getGamesByUser } from '../controllers/games.controllers.js';


const router = Router();


router.get('/juegos', getAllGames);
router.get('/juegos/filtrar', getGamesByFilter);
router.get('/juegos/usuario/:idUser', getGamesByUser);
router.get('/juegos/:id', getGame);
// router.get('/juegos/:id', getUser);
// router.patch('/juegos/:id', updateProfile);
// router.delete('/juegos/:id', autorizarRol(['admin']), deleteUser);
// router.get('/alumnos', autenticarToken, getAlumnos);
// //router.get('/alumnos/:id', getAlumno);
// router.get('/alumnos/idAlumno/:id', autenticarToken, getAlumno);
// router.get('/alumnos/idCurso/:idCurso', autenticarToken, getAlumnoCurso);

// router.post('/alumnos', autenticarToken, autorizarRol(['admin','user']), validar, addAlumno);
// router.put('/alumnos/:id', autenticarToken, autorizarRol(['admin','user']), validar, updateAlumno);

// router.patch('/alumnos/:id', autenticarToken, autorizarRol(['admin','user']), validar, updatePatchAlumno);
// router.delete('/alumnos/:id', autenticarToken, autorizarRol(['admin','user']), delAlumno);

export { router as routesGames };
