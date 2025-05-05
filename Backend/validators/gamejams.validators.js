"use strict";

import { check, validationResult } from "express-validator";

export const validateProfile = [
  check("username")
    .optional()
    .notEmpty()
    .withMessage("El username no puede estar vacío")
    .matches(/^[a-zA-Z0-9 ]+$/)
    .withMessage("El username solo puede contener letras, números y espacios"),
  check("profile_image")
    .optional()
    .notEmpty()
    .withMessage("La imagen de perfil no puede estar vacía"),

  (req, res, next) => {
    //función que maneja los errores
    const errores = validationResult(req); //recoge los errores de validación de la petición al servidor
    if (!errores.isEmpty()) {
      //Si hay errores, se responde con el error 400
      return res.status(400).json({ errors: errores.array() });
    } else {
      //Si no hay errores se pasa al siguiente middleware
      next();
    }
  },
];
