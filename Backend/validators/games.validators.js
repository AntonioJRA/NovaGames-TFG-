"use strict";

import { check, validationResult } from "express-validator";

export const validateUpdateRatings = [
  check("idGame")
    .exists()
    .notEmpty()
    .withMessage("El idGame no puede estar vacío")
    .isInt()
    .withMessage("El idGame debe ser un número entero"),
  check("userRating")
    .exists()
    .notEmpty()
    .withMessage("El userRating no puede estar vacío")
    .isNumeric({ min: 0, max: 5 })
    .withMessage("El userRating debe ser un número"),

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

export const validateGamesByFilter = [
  check("categories")
    .optional()
    .matches(/^(\d+,)*\d+$/)
    .withMessage(
      "El formato de categorías no es válido. Usa números separados por comas."
    ),

  check("rating")
    .optional()
    .notEmpty()
    .withMessage("El rating no puede estar vacío")
    .isNumeric({ min: 0, max: 5 })
    .withMessage("El rating debe ser un número"),
  check("time")
    .optional()
    .notEmpty()
    .withMessage("El time no puede estar vacío")
    .isIn(["week", "month", "year"])
    .withMessage('El valor debe ser "day" o "week"'),

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
