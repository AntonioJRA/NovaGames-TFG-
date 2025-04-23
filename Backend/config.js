"use strict";
import {config} from "dotenv";

 //leer las variables globales
 config();
//acceder a variables globales: process.env     //coge las variables por defecto de los hosts
export const PORT = process.env.PORT;
export const DB_PORT = process.env.DB_PORT;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const DB_NAME = process.env.DB_NAME;
export const SECRET_KEY = process.env.SECRET_KEY;
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;