"use strict";
//Importar el paquete express
import express from "express";
import cors from "cors";
import nodeCron from "node-cron";
import multer from "multer";
import path from "path";
import { routerAuth } from "./routes/auth.routes.js";
import { PORT } from "./config.js";
import { pool } from "./db.js";
import { routesUsers } from "./routes/users.routes.js";
import { routesGames } from "./routes/games.routes.js";
import { routesGameJams } from "./routes/gamejams.routes.js";
import { routesSectionGames } from "./routes/sectiongames.routes.js";
import { routesPosts } from "./routes/posts.routes.js";
import { routesComments } from "./routes/comments.routes.js";
import { routesCategories } from "./routes/categories.routes.js";
import { autenticarToken } from "./controllers/auth.controllers.js";

// functions
const deleteNoVerifUsers = () => {
  // nodeCron.schedule('* * * * *', async () => {     // un minuto
  nodeCron.schedule("0 0 * * 1", async () => {
    // una semana
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Fecha de hace una semana
    try {
      const [result] = await pool.query(
        `
              DELETE FROM users 
              WHERE is_verified = false AND registration_date < ?
          `,
        [oneWeekAgo]
      );

      console.log(`Usuarios no verificados eliminados: ${result.affectedRows}`);
    } catch (error) {
      console.error("Error al eliminar usuarios no verificados:", error);
    }
  });
};

const closeEndedGameJams = () => {
  nodeCron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const [rows] = await pool.query(
        `
              SELECT id FROM game_jams 
              WHERE voting_end <= ? AND is_open = TRUE
              ORDER BY voting_end DESC
              LIMIT 1
            `,
        [now]
      );

      if (rows.length > 0) {
        // ponemos a false la antigua
        await pool.query(
          `UPDATE game_jams SET is_last = FALSE WHERE is_last = TRUE`
        );
        // ahora es la mas antigua
        const jamId = rows[0].id;
        await pool.query(
          `UPDATE game_jams SET is_open = FALSE, is_last = TRUE WHERE id = ?`,
          [jamId]
        );
        console.log("🔴 Cerrada game jam ID:", jamId, "en", now);
      }
    } catch (err) {
      console.error("Error al cerrar game jam:", err);
    }
  });
};

const openStartedGameJams = () => {
  nodeCron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Comprobamos si hay alguna abierta
      const [rows] = await pool.query(
        `SELECT 1 FROM game_jams WHERE is_open = TRUE LIMIT 1`
      );

      if (rows.length === 0) {
        const [rows2] = await pool.query(
          `SELECT id FROM game_jams WHERE registration_start <= ? && voting_end >= ? ORDER BY registration_start DESC`,
          [now, now]
        );
        if (rows2.length !== 0) {
          const jamId = rows2[0].id;
          await pool.query(`UPDATE game_jams SET is_open = TRUE WHERE id = ?`, [
            jamId,
          ]);
          console.log("🟢 Abierta game jam ID:", jamId, "en", now);
        }
      }
    } catch (err) {
      console.error("Error al abrir game jam:", err);
    }
  });
};

//crear una aplicación express
const app = express();

// Configuración Multer para guardar en public/images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    // Puedes cambiar el nombre para evitar duplicados, aquí un ejemplo con timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

//establecer cors (normas de navegadores que bloquean peticiones de otros dominios)
// app.use(cors());

// CORS config
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// Ruta POST para subir imagen
app.post(
  "/upload-image",
  autenticarToken,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Error al subir la imagen" });
    }
    res.json({
      filename: req.file.filename,
      path: `/images/${req.file.filename}`,
    });
  }
);

//para parsear la petición al usuario
app.use(express.json());

// ruta de imagenes
app.use("/images", express.static("public/images"));

//ruta de autenticación
app.use(routerAuth);

//usar rutas directas
app.use(routesUsers);
app.use(routesGames);
app.use(routesGameJams);
app.use(routesSectionGames);
app.use(routesPosts);
app.use(routesComments);
app.use(routesCategories);

// Cron job para eliminar usuarios no verificados después de una semana
deleteNoVerifUsers();
closeEndedGameJams();
openStartedGameJams();
//ruta principal
app.get("/", (req, res) => {
  res.end("Hello world from Node.js Server");
});

//manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).send("Wrong page!!!");
});

app.listen(PORT, () => {
  console.log(`Server running in URL http://localhost:${PORT}`);
});
