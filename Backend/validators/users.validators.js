"use strict"

import {check, validationResult} from 'express-validator';

export const validar=[
    check('nomApe').exists().withMessage("Falta el nombre del alumno"),
    check('nomApe').notEmpty().withMessage("El nombre no puede estar vacío"),
    check('nomApe').isLength({min:5, max:50}).withMessage("El nombre del alumno debe tener entre 5 y 30 caracteres"),
    check('idCurso').exists().notEmpty().isLength({min:3,max:10}).withMessage("El curso no puede estar vacío y debe tener entre 3 y 10 caracteres"),
    (req, res, next)=>{ //función que maneja los errores
        const errores= validationResult(req); //recoge los errores de validación de la petición al servidor
        if (!errores.isEmpty()){ //Si hay errores, se responde con el error 400
            return res.status(400).json({errors: errores.array()})
        }else{ //Si no hay errores se pasa al siguiente middleware
            next();
        }
    }
]

