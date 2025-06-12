"use strict"

import { Router } from 'express';
import { validateChangePassword, validateChangeUserRole, validateDeleteUser, validateProfile, validateUpdateNovapoints } from '../validators/users.validators.js';
import { temporalyBanUser, changePassword, changeUserRole, deleteUser, downgradeDeveloperToUser, getAllUsers, getUser, getVotesByUser, updateNovapoints, updateProfile, upgradeUserToDeveloper, permanentlyBanUser, temporalyUnbanUser, permanentlyUnbanUser } from '../controllers/users.controllers.js';
import { autorizarRol, autenticarToken } from '../controllers/auth.controllers.js';

const router = Router();

// // Obtiene todos los usuarios
router.get('/api/usuarios', getAllUsers);
// get 1 (user logueado via token)
router.get('/api/usuarios/usuario', autenticarToken, getUser);
// get votes by user from active gamejam
router.get('/api/usuarios/votos', autenticarToken, getVotesByUser);
// user → dev (publica un juego)
router.put('/api/usuarios/usuario-desarrollador', autenticarToken, upgradeUserToDeveloper);
// dev → user (elimina todos sus juegos)
router.put('/api/usuarios/desarrollador-usuario', autenticarToken, downgradeDeveloperToUser);
// dev → user (elimina todos sus juegos)
router.put('/api/usuarios/actualizar-novapoints', autenticarToken, validateUpdateNovapoints, updateNovapoints);
// Permite al usuario modificar su perfil
router.patch('/api/usuarios/perfil/editar-perfil', autenticarToken, validateProfile, updateProfile);
// Permite al usuario cambiar su contraseña
router.patch('/api/usuarios/perfil/cambiar-password', validateChangePassword, changePassword);
// update rol (a cualquier rol)
router.put('/api/usuarios/perfil/cambiar-rol', autenticarToken, autorizarRol(['admin']), validateChangeUserRole, changeUserRole);
// ban user
router.patch('/api/usuarios/ban/:id', autenticarToken, autorizarRol(['admin']), temporalyBanUser);
// unban user
router.patch('/api/usuarios/unban/:id', autenticarToken, autorizarRol(['admin']), temporalyUnbanUser);
// permaban user
router.patch('/api/usuarios/permaban/:id', autenticarToken, autorizarRol(['admin']), permanentlyBanUser);
// unpermaban user
router.patch('/api/usuarios/unpermaban/:id', autenticarToken, autorizarRol(['admin']), permanentlyUnbanUser);
// // Permite a los admin banear usuarios
// router.delete('/api/usuarios/eliminar/:id', autenticarToken, autorizarRol(['admin']), deleteUser);


export { router as routesUsers };
