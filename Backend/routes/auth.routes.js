import { Router } from "express";
import { login, register, refreshToken,activarCuenta, autenticarToken } from "../controllers/auth.controllers.js";
import { validarLogin, validarRegister } from "../validators/auth.validator.js";

const router=new Router();  //para manejar las rutas

//se pone por seguridad en post
router.post('/api/login', validarLogin, login);
router.post('/api/register', validarRegister, register);
router.get('/api/refresh-token', autenticarToken, refreshToken);
router.get('/api/activar/:token', activarCuenta);

//exportar las rutas
export {router as routerAuth}