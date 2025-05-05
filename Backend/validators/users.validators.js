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

export const validateUpdateNovapoints = [
  check("rewards")
    .exists()
    .notEmpty()
    .withMessage("El rewards no puede estar vacío")
    .isInt()
    .withMessage("El rewards debe ser un número entero"),

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

export const validateChangePassword = [
  check("password")
    .exists()
    .withMessage("La contraseña es obligatoria")
    .notEmpty()
    .withMessage("La contraseña no puede estar vacía")
    .isLength({ min: 8, max: 16 })
    .withMessage("Debe tener entre 8 y 16 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .withMessage(
      "Debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial"
    ),
  check("repeatPassword")
    .exists()
    .withMessage("La confirmación de contraseña es obligatoria")
    .notEmpty()
    .withMessage("La confirmación de contraseña no puede estar vacía"),

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

export const validateChangeUserRole = [
  check("idUser")
    .exists()
    .notEmpty()
    .withMessage("Es necesario introducir el idUser")
    .isNumeric()
    .withMessage("El ID debe ser un número"),
  check("role")
    .exists()
    .notEmpty()
    .withMessage("Es necesario introducir el rol")
    .isIn(["user", "developer", "admin"])
    .withMessage('El rol debe ser "user", "developer" o "admin" '),

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

export const validateDeleteUser = [
  check("idUser")
    .exists()
    .notEmpty()
    .withMessage("Es necesario introducir el idUser")
    .isNumeric()
    .withMessage("El ID debe ser un número"),

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
