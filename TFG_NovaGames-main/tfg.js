import { Router } from "express";
import { getAlumnos, getAlumno, addAlumno, delAlumno, updatePutAlumno, updatePatchAlumno, getAlumnoIdCurso } from "../controllers/alumnos.controllers.js";
import { validar } from "../validators/alumnos.validator.js";
import { autenticarToken, autorizarRole } from "../controllers/auth.controllers.js";

const router=new Router();  //para manejar las rutas

router.get('/alumnos', autenticarToken, getAlumnos);
router.get('/alumnos/idAlumno/:idAlumno', autenticarToken, getAlumno);
router.get('/alumnos/idCurso/:idCurso', autenticarToken, getAlumnoIdCurso);

router.post('/alumnos', autenticarToken, autorizarRole(['admin', 'user']), validar, addAlumno);

router.put('/alumnos/:id', autenticarToken, autorizarRole(['admin', 'user']), validar, updatePutAlumno);

router.patch('/alumnos/:id', autenticarToken, autorizarRole(['admin', 'user']), validar, updatePatchAlumno)

router.delete('/alumnos/:id', autenticarToken, autorizarRole(['admin', 'user']), delAlumno);

//exportar las rutas
export {router as routerAlumnos}