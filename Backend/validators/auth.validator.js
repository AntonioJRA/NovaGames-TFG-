"use strict";
import { check, validationResult } from "express-validator";

export const validarLogin = [
  check("email")
    .exists()
    .withMessage("El email es obligatorio")
    .notEmpty()
    .withMessage("El email no puede estar vacío")
    .isEmail()
    .normalizeEmail()
    .withMessage("Debe tener formato de email"),

  check("password")
    .exists()
    .withMessage("La contraseña es obligatoria")
    .notEmpty()
    .withMessage("La contraseña no puede estar vacía"),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      //si hay errores
      return res.status(400).json({ errors: errores.array() });
    } else {
      next(); //si no hay errores se pasa al siguiente middleware (controlador)
    }
  },
];

export const validarRegister = [
  check("username")
    .exists()
    .withMessage("El username es obligatorio")
    .notEmpty()
    .withMessage("El username no puede estar vacío")
    .isLength({ min: 6, max: 30 })
    .withMessage("Debe tener al menos 6 caracteres")
    .matches(/^[a-zA-Z0-9 ]+$/)
    .withMessage("El username solo puede contener letras, números y espacios"),

  check("email")
    .exists()
    .withMessage("El email es obligatorio")
    .notEmpty()
    .withMessage("El email no puede estar vacío")
    .isEmail()
    .normalizeEmail()
    .withMessage("Debe tener formato de email"),

  check("password")
    .exists()
    .withMessage("La contraseña es obligatoria")
    .notEmpty()
    .withMessage("La contraseña no puede estar vacía")
    .isLength({ min: 8 })
    .withMessage("Debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .withMessage(
      "Debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial"
    ),

  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      //si hay errores
      return res.status(400).json({ errors: errores.array() });
    } else {
      next(); //si no hay errores se pasa al siguiente middleware (controlador)
    }
  },
];
