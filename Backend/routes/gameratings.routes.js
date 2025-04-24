"use strict"

import { Router } from 'express';
import { validateChangePassword, validateChangeUserRole, validateDeleteUser, validateProfile } from '../validators/users.validators.js';
import { changePassword, changeUserRole, deleteUser, getAllUsers, getUser, updateProfile, upgradeUserToDeveloper } from '../controllers/users.controllers.js';
import { autorizarRol, autenticarToken } from '../controllers/auth.controllers.js';

const router = Router();

// Obtiene todos los usuarios
router.get('/usuarios', getAllUsers);
// Perfil del usuario
router.get('/usuarios/:id', getUser);
// Convierte al usuario automáticamente de user a developer cuando sube su primer juego
router.put('/usuarios/desarrollador', autenticarToken, upgradeUserToDeveloper);
// Permite al usuario modificar su perfil
router.patch('/usuarios/perfil/editar-perfil', autenticarToken, validateProfile, updateProfile);
// Permite al usuario cambiar su contraseña
router.put('/usuarios/perfil/cambiar-password', autenticarToken, validateChangePassword, changePassword);
// Permite a los admin cambiar el rol de cualquier usuario, en caso de hacer falta manualmente
router.put('/usuarios/perfil/cambiar-rol', autenticarToken, autorizarRol(['admin']), validateChangeUserRole, changeUserRole);
// Permite a los admin banear usuarios
router.delete('/usuarios', autenticarToken, autorizarRol(['admin']), validateDeleteUser, deleteUser);


export { router as routesUsers };
