import { pool } from "../db.js";

export const updateGameRatings = async (req, res) => {
  const { idGame, userRating } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE games SET rating_count = rating_count + 1, rating_sum = rating_sum + ? WHERE id = ?",
      [userRating, idGame]
    );

    if (result.affectedRows == 1) {
      res.status(200).json({ message: "Ratings actualizado" });
    } else {
      res.status(400).json({ message: "Ratings no actualizado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar ratings" });
  }
};

export const getAllUserGames = async (req, res) => {
  const id = req.user.id;
  try {
    const [result] = await pool.query(
      "SELECT * FROM games WHERE developer_id = ?",
      [id]
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getAllGames = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM games");
    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS count FROM games"
    );

    res.status(200).json({
      results: countResult[0].count,
      games: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getSearchedGames = async (req, res) => {
  const { searchedGame } = req.body;
  try {
    const [result] = await pool.query(
      "SELECT * FROM games WHERE title LIKE ?;",
      [`%${searchedGame}%`]
    );
    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS count FROM games WHERE title LIKE ?;",
      [`%${searchedGame}%`]
    );

    if (result.length === 0)
      return res.status(200).json({
        message: "No se encontraron resultados",
        games: 0,
      });

    res.status(200).json({
      results: countResult[0].count,
      games: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getGame = async (req, res) => {
  const { id } = req.params;
  try {
    const [[result]] = await pool.query("SELECT * FROM games WHERE id = ?", [
      id,
    ]);
    if (!result) res.status(200).json("No existe el juego");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juego", error: error.message });
  }
};

export const getRandomGames = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM games ORDER BY RAND() LIMIT 30"
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const publicGame = async (req, res) => {
  const { idGame } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE games SET is_open = true WHERE id = ?",
      [idGame]
    );
    res.json({ message: "Juego publicado" });
  } catch (err) {
    res.status(500).json({ message: "Error al publicar juego", error: err });
  }
};

export const getGamesByFilter = async (req, res) => {
  const { category, rating, time } = req.query;

  try {
    let games = "SELECT * FROM games";
    let count = "SELECT COUNT(*) as count FROM games";
    let query = "";
    let params = [];

    if (category || rating || time) {
      // Filtro por categoría
      if (category) {
        query += ` JOIN game_categories AS gc ON games.id = gc.game_id WHERE gc.category_id = ?`;
        params.push(category);
      } else {
        query += " WHERE 1=1";
      }

      // Filtro por fecha
      if (time === "week") {
        query += ` AND upload_date >= NOW() - INTERVAL 7 DAY`;
      } else if (time === "month") {
        query += ` AND upload_date >= NOW() - INTERVAL 1 MONTH`;
      } else if (time === "year") {
        query += ` AND upload_date >= NOW() - INTERVAL 1 YEAR`;
      }

      // Orden por valoración
      if (rating) {
        query += ` AND rating >= ${rating}`;
      }
    }
    // Combinamos las queries
    games += query;
    count += query;

    const [result] = await pool.query(games, params);
    const [countResult] = await pool.query(count, params);

    if (result.length === 0)
      return res.status(404).json({
        message: "No existe ningún juego con los filtros especificados",
      });

    res.status(200).json({
      results: countResult[0].count,
      games: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juego", error: error.message });
  }
};

export const getMostRatedGamesLimit = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM games ORDER BY rating DESC, RAND() LIMIT 10"
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los 10 juegos mejor valorados",
      error: error.message,
    });
  }
};

export const getMostRecentGamesLimit = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM games ORDER BY upload_date DESC LIMIT 10"
    );
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los juegos", error: error.message });
  }
};

export const addGame = async (req, res) => {
  const idUser = req.user.id;
  const { title } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO games (developer_id, title) VALUES (?,?)",
      [idUser, title]
    );

    res.status(201).json({ message: "Juego creado con éxito" });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

// tfg controller

export const deleteGame = async (req, res) => {
  //extraer los campos
  const { idGame } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM games WHERE idAlumno = ?", [
      idGame,
    ]);

    if (result.affectedRows == 1) {
      res.status(200).json({ message: "Juego eliminado" });
    } else {
      res.status(400).json({ message: "Juego no eliminado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el juego" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM categories");
    if (result.length === 0) return res.status(404).json("No hay categorías");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los juegos", error: error.message });
  }
};

export const getGameJamsByRecentOrder = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM game_jams ORDER BY update_date DESC"
    );
    if (result.length === 0) return res.status(404).json("No hay game jams");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los juegos", error: error.message });
  }
};

export const getOpenGameJams = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM game_jams WHERE is_open = true"
    );
    if (result.length === 0)
      return res.status(404).json("No hay game jams activas");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las game jams",
      error: error.message,
    });
  }
};

export const getGameJam = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "SELECT * FROM game_jams WHERE id = ? LIMIT 1",
      [id]
    );
    if (result.length === 0)
      return res.status(404).json("No existe la game jam");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la game jam", error: error.message });
  }
};

export const getParticipantsGameJam = async (req, res) => {
  const { idGameJam } = req.params;
  try {
    const [result] = await pool.query("SELECT * FROM game_jam_participants", [
      idGameJam,
    ]);

    const [countResult] = await pool.query(
      "SELECT count(*) as total FROM game_jam_participants",
      [idGameJam]
    );

    if (result.length === 0)
      return res.status(404).json("No hay participantes");

    res.status(200).json(result, countResult);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la game jam", error: error.message });
  }
};

// export const joinGameJam = async (req, res) => {
//   try {
//     const { idGameJam } = req.params;

//     const [result] = await pool.query(
//       "SELECT * FROM game_jam_participants",
//       [idGameJam]
//     );

//     res.status(200).json({message: 'Has sido inscrito en la Game Jam'});
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error al obtener la game jam", error: error.message });
//   }
// };

export const getVotes = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM game_jam_votes");

    if (result.length === 0) return res.status(404).json("No hay votos");

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la game jam", error: error.message });
  }
};

export const checkUserVote = async (req, res) => {
  // url/nombre_gj/juego_gj
  const { gameJamId, gameId } = req.params;
  // del jwt
  const userId = req.user.id;
  try {
    // Comprobar si el usuario ya ha votado por este juego en esta game jam
    const [existingVote] = await pool.query(
      `SELECT * FROM votes WHERE user_id = ? AND game_jam_id = ? AND game_id = ?`,
      [userId, gameJamId, gameId]
    );

    if (existingVote.length > 0) {
      // El usuario ya votó
      res.status(200).json({ hasVoted: true, voteId: existingVote[0].id });
    } else {
      // El usuario no ha votado
      res.status(200).json({ hasVoted: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el voto", error: error.message });
  }
};

export const addVote = async (req, res) => {
  try {
    /* usuario del jwt
    juego y gamejam de juegos_game_jam
    */

    const { originalidad, arte, musica, diversion, tema, comentario } =
      req.body;
    const params = [
      "originalidad",
      "arte",
      "musica",
      "diversion",
      "tema",
      "comentario",
    ];
    const values = [originalidad, arte, musica, diversion, tema, comentario];

    // Construir la parte de columnas dinámicamente
    const columns = params.join(", ");

    // Construir la parte de valores dinámicamente
    const placeholders = params.map(() => "?").join(", ");

    // Ejecutar la consulta
    const [result] = await pool.query(
      `INSERT INTO game_jam_votes (${columns}) VALUES (${placeholders})`,
      values
    );

    if (result.affectedRows == 1) {
      res.status(201).json({ message: "Voto insertado", id: result.insertId });
    } else {
      res.status(400).json({ message: "Voto no insertado" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la game jam", error: error.message });
  }
};

export const updatePatchAlumno = async (req, res) => {
  //updatea uno en concreto
  //extraer los campos
  const { apeNom, idCurso } = req.body;
  const { id } = req.params; //extraer de la URL el id
  try {
    const [result] = await pool.query(
      "update alumnos set apellidosNombre=ifnull(?,apellidosNombre), idCurso=ifnull(?,idCurso) where idAlumno=?",
      [apeNom, idCurso, id]
    );
    // console.log(result);
    if (result.affectedRows == 1) {
      res.status(200).json({ message: "Alumno actualizado" });
    } else {
      res.status(400).json({ message: "Alumno no actualizado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el alumno" });
  }
};

export const deleteVote = async (req, res) => {
  //extraer los campos
  const { idVote } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE from game_jam_votes WHERE id = ?",
      [idVote]
    );

    if (result.affectedRows == 1) {
      res.status(200).json({ message: "Voto eliminado" });
    } else {
      res.status(400).json({ message: "Voto no eliminado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el voto" });
  }
};
