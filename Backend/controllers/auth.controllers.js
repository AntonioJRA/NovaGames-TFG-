import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../db.js";
import { REFRESH_SECRET_KEY, SECRET_KEY } from "../config.js";
import { sendMail } from "../mailer.js";

const URL = "http://localhost:3000";
const FRONT_URL = "http://localhost:4200";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [result] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    //comprobar si el email existe
    if (result.length == 0) {
      return res.status(401).json({ message: `wrong credentials` });
    }

    //verificar la contraseña con bcrypt
    const validatePass = await bcrypt.compare(password, result[0].password); //al ser la respuesta un array de objetos, hay que indicar que está en la posición 0

    if (!validatePass) {
      //si no coincide
      return res.status(401).json({ message: `wrong credentials` });
    }
    //Verificar que la cuenta esta activada
    if (!result[0].is_verified) {
      return res.status(403).json({ message: "account no verif" });
    }

    //generar el token
    const token = jwt.sign(
      {
        id: result[0].id,
        role: result[0].role,
        createTo: new Date().toISOString(),
      },
      SECRET_KEY,
      {
        //https://jwt.io todas las partes de jwt
        expiresIn: "7d",
      }
    );

    //generar refresh_token (7 días)
    const refreshToken = jwt.sign(
      {
        id: result[0].id,
        role: result[0].role,
        createTo: new Date().toISOString(),
      },
      REFRESH_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    //guardar refreshToken en una cookie HTTP-only (sólo puede acceder el servidor)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, //la cookie es accesible sólo por el servidor, no por js
      secure: true,
      sameSite: "Strict", //protección CSRF   (envío de solicitud de otros sitios controlado)
    });

    // //enviar un email
    // sendMail(
    //   result[0].email,
    //   "Logged",
    //   `<h1>Hola ${result[0].username} 22</h1><p>Gracias por loguearte en la app</p>`
    // );

    //devolver al usuario el token
    res.status(200).json({ token: token });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

export const autenticarToken = async (req, res, next) => {
  //extraer el token de la petición (req)
  const autHeader = req.headers["authorization"];
  if (!autHeader) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  //extraer el token de la constante autHeader
  const token = autHeader.split(" ")[1];
  //verificar la autenticidad del token
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token no válido" });
    }
    req.user = user;
    next(); //hace el método que tenga después en el routes, como getAlumnos
  });
};

export const register = async (req, res) => {
  const { username, password, email } = req.body;
  const lang = req.headers["accept-language"] || "es";
  console.log(lang);

  try {
    // SELECT 1 devuelve solo un valor, y LIMIT 1 hace que el motor de la base de datos se detenga al encontrar el primer resultado, lo cual mejora el rendimiento.
    const [user] = await pool.query(
      "SELECT 1 FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (user.length > 0) {
      return res
        .status(403)
        .json({ message: "Ya existe un usuario con ese email" });
    } else {
      //encripta la contraseña con 10 rondas de seguridad
      const hashedPassword = await bcrypt.hash(password, 10);
      const activacionToken = uuidv4();

      const [result] = await pool.query(
        "INSERT INTO users (username, email, password, role, registration_date, is_verified, verification_token) VALUES (?,?,?,'user',now(),?,?)",
        [username, email, hashedPassword, false, activacionToken]
      );

      //enviar el email para notificar la activacion
      const activarLink = `${URL}/api/activar/${activacionToken}`;

      let emailHTML;

      if (lang === "es") {
        emailHTML = `
            <h2>¡Bienbenid@ a NovaGames!</h2>
            <p>Para activar tu cuenta, haz click en el siguiente enlace:</p>
            <a href="${activarLink}">Activar cuenta</a>`;
      } else {
        emailHTML = `
            <h2>Welcome to NovaGames!</h2>
            <p>To activate your account, click the following link:</p>
            <a href="${activarLink}">Activate account</a>`;
      }

      await sendMail(email, "NovaGames Account", emailHTML);

      console.log(result);

      if (result.affectedRows == 1) {
        res
          .status(201)
          .json({ message: "Usuario creado exitosamente: " + result.insertId });
      } else {
        res.status(400).json({ message: "Usuario no insertado" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error al insertar el usuario" });
  }
};

export const developerVerification = async (req, res) => {
  const id = req.user.id;
  const { idGame } = req.body;
  try {
    const [[result]] = await pool.query(
      "SELECT developer_id FROM games WHERE id = ? LIMIT 1",
      [idGame]
    );

    if (result.developer_id === id) {
      return res.status(200).json({ message: "Verif" });
    } else {
      return res.status(200).json({ message: "No verif" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken; //el refresh token viene en la cookie HTTP-only
  //validar que se envió el refresh token
  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "No hay refresh token, inicie sesión nuevamente" });
  }
  try {
    //verificar que el refresh token es válido
    const decodificarToken = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    if (decodificarToken) {
      return res.status(401).json({
        message: "Refresh token es inválido, inicie sesión nuevamente",
      });
    } else {
      //generar nuevo token
      const token = jwt.sign(
        {
          id: result[0].id,
          role: result[0].role,
          createTo: new Date().toISOString(),
        },
        SECRET_KEY,
        {
          //https://jwt.io todas las partes de jwt
          expiresIn: "1h",
        }
      );
      return res.status(200).json({ accessToken: token });
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param {Array} rolesPermitidos donde establecerá los roles permitidos
 * @returns o un error o permite que siga al siguiente método
 */
export const autorizarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tiene permiso para acceder a esta ruta" });
    }
    next();
  };
};

export const activarCuenta = async (req, res) => {
  const { token } = req.params;

  const [user] = await pool.query(
    "SELECT id, role FROM users WHERE verification_token = ? LIMIT 1",
    [token]
  );

  if (user.length === 0) {
    res.status(400).json({ message: "token no valido o no existe" });
  } else {
    await pool.query(
      `UPDATE users SET is_verified = ?, verification_token = ? WHERE verification_token = ?`,
      [true, null, token]
    );

    //generar el token
    const jwtToken = jwt.sign(
      {
        id: user[0].id,
        role: user[0].role,
        createTo: new Date().toISOString(),
      },
      SECRET_KEY,
      {
        //https://jwt.io todas las partes de jwt
        expiresIn: "1h",
      }
    );

    // Redireccionar al frontend con el token
    return res.redirect(`${FRONT_URL}/auth/${jwtToken}`);

    // res.status(200).json({
    //   message: "Cuenta activada correctamente. Ya puedes iniciar sesion.",
    // });
  }
};
