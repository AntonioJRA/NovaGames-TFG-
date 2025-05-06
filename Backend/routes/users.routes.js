"use strict"

import { Router } from 'express';
import { validateChangePassword, validateChangeUserRole, validateDeleteUser, validateProfile, validateUpdateNovapoints } from '../validators/users.validators.js';
import { changePassword, changeUserRole, deleteUser, downgradeDeveloperToUser, getAllUsers, getUser, getVotesByUser, updateNovapoints, updateProfile, upgradeUserToDeveloper } from '../controllers/users.controllers.js';
import { autorizarRol, autenticarToken } from '../controllers/auth.controllers.js';

const router = Router();

// // Obtiene todos los usuarios
// router.get('/usuarios', getAllUsers);
// get 1 (user logueado via token)
router.get('/usuarios/usuario', autenticarToken, getUser);
// get votes by user from active gamejam
router.get('/usuarios/votos', autenticarToken, getVotesByUser);
// user → dev (publica un juego)
router.put('/usuarios/usuario-desarrollador', autenticarToken, upgradeUserToDeveloper);
// dev → user (elimina todos sus juegos)
router.put('/usuarios/desarrollador-usuario', autenticarToken, downgradeDeveloperToUser);
// dev → user (elimina todos sus juegos)
router.put('/usuarios/actualizar-novapoints', autenticarToken, validateUpdateNovapoints, updateNovapoints);
// Permite al usuario modificar su perfil
router.patch('/usuarios/perfil/editar-perfil', autenticarToken, validateProfile, updateProfile);
// Permite al usuario cambiar su contraseña
router.put('/usuarios/perfil/cambiar-password', autenticarToken, validateChangePassword, changePassword);
// update rol (a cualquier rol)
router.put('/usuarios/perfil/cambiar-rol', autenticarToken, autorizarRol(['admin']), validateChangeUserRole, changeUserRole);
// // Permite a los admin banear usuarios
// router.delete('/usuarios', autenticarToken, autorizarRol(['admin']), validateDeleteUser, deleteUser);


export { router as routesUsers };
