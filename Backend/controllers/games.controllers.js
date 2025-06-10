import { pool } from "../db.js";
import { sendMail } from "../mailer.js";

export const getGameRatingByUser = async (req, res) => {
  const idUser = req.user.id;
  const { id: idGame } = req.query;

  try {
    if (!idGame) {
      return res.status(400).json({ message: "Proporciona el idGame" });
    }

    const [[result]] = await pool.query(
      "SELECT rating FROM game_ratings WHERE game_id = ? AND user_id = ?",
      [idGame, idUser]
    );

    if (!result) return res.status(200).json(null);

    return res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const addGameRating = async (req, res) => {
  const idUser = req.user.id;
  const { idGame, userRating } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO game_ratings (game_id, user_id, rating)VALUES (?,?,?)",
      [idGame, idUser, userRating]
    );

    const [result2] = await pool.query(
      "UPDATE games SET rating_count = rating_count + 1, rating_sum = rating_sum + ? WHERE id = ?",
      [userRating, idGame]
    );

    if (result.affectedRows == 1 && result2.affectedRows == 1) {
      res.status(200).json({ message: "Ratings actualizado" });
    } else {
      res.status(400).json({ message: "Ratings no actualizado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar ratings" });
  }
};

export const updateGameRating = async (req, res) => {
  const idUser = req.user.id;
  const { idGame, userRating } = req.body;

  try {
    const [[oldRating]] = await pool.query(
      "SELECT rating FROM game_ratings WHERE game_id = ? AND user_id = ?",
      [idGame, idUser]
    );

    if (!oldRating)
      res.status(200).json({ message: "No hay voto que actualizar" });

    const resultRating = userRating - Number(oldRating.rating);

    const [result] = await pool.query(
      "UPDATE game_ratings SET rating = ? WHERE game_id = ? AND user_id = ?",
      [userRating, idGame, idUser]
    );

    const [result2] = await pool.query(
      "UPDATE games SET rating_sum = rating_sum + ? WHERE id = ?",
      [resultRating, idGame]
    );

    if (result.affectedRows == 1 && result2.affectedRows == 1) {
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

export const getLastGame = async (req, res) => {
  try {
    const [[result]] = await pool.query(
      "SELECT * FROM games ORDER BY id DESC LIMIT 1"
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getAllGamesWithUserEmail = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT g.*, u.email FROM games as g JOIN users as u ON u.id = g.developer_id ORDER BY g.id"
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
    const [result] = await pool.query(
      "SELECT * FROM games WHERE is_open = TRUE"
    );
    const [countResult] = await pool.query(
      "SELECT COUNT(*) AS count FROM games WHERE is_open = TRUE"
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

// export const getSearchedGames = async (req, res) => {
//   const { searchedGame } = req.body;
//   try {
//     const [result] = await pool.query(
//       "SELECT * FROM games WHERE title LIKE ?;",
//       [`%${searchedGame}%`]
//     );
//     const [countResult] = await pool.query(
//       "SELECT COUNT(*) AS count FROM games WHERE title LIKE ?;",
//       [`%${searchedGame}%`]
//     );

//     if (result.length === 0)
//       return res.status(200).json({
//         message: "No se encontraron resultados",
//         games: 0,
//       });

//     res.status(200).json({
//       results: countResult[0].count,
//       games: result,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error al obtener juegos", error: error.message });
//   }
// };

export const getGame = async (req, res) => {
  const { id } = req.params;
  try {
    const [[result]] = await pool.query("SELECT * FROM games WHERE id = ?", [
      id,
    ]);

    if (!result) return res.status(200).json({ message: "No existe el juego" });

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
      "SELECT * FROM games WHERE is_open = TRUE ORDER BY RAND() LIMIT 30"
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
  const { categories, rating, time } = req.query;

  try {
    let games = "SELECT * FROM games";
    let count = "SELECT COUNT(*) as count FROM games";
    let query = " WHERE is_open=TRUE";
    let joins = "";
    let params = [];

    if (categories || rating || time) {
      // Filtro por categoría
      if (categories) {
        const categoryArray = categories.split(",").map(Number);
        const placeholders = categoryArray.map(() => "?").join(",");
        joins += ` JOIN game_categories AS gc ON games.id = gc.game_id`;
        query += ` AND gc.category_id IN (${placeholders})`;
        params.push(...categoryArray);
      } else {
        query += " ";
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
        query += ` AND total_rating >= ?`;
        params.push(Number(rating));
      }
    }
    // Combinamos las queries
    games += joins + query;
    count += joins + query;

    const [result] = await pool.query(games, params);
    const [countResult] = await pool.query(count, params);

    if (result.length === 0)
      return res.status(200).json({
        results: 0,
        games: [],
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
      "SELECT * FROM games WHERE is_open=TRUE ORDER BY total_rating DESC, RAND() LIMIT 10"
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
      "SELECT * FROM games WHERE is_open=TRUE ORDER BY upload_date DESC LIMIT 10"
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
    if (!title) res.status(400).json({ message: "Inserte un título" });

    const [result] = await pool.query(
      "INSERT INTO games (developer_id, title) VALUES (?,?)",
      [idUser, title]
    );

    if (result.affectedRows == 1) {
      res.status(201).json({ message: "Juego creado con éxito" });
    } else {
      res.status(400).json({ message: "Error al crear el juego" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const updateGameDownloads = async (req, res) => {
  const { idGame } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE games SET downloads = downloads + 1 WHERE id = ?",
      [idGame]
    );

    if (result.affectedRows == 1) {
      res.status(200).json({ message: "downloads actualizado" });
    } else {
      res.status(400).json({ message: "downloads no actualizado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar downloads" });
  }
};

export const deleteGame = async (req, res) => {
  //extraer los campos
  const { idGame } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM games WHERE id = ?", [
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

export const deleteGameByAdmin = async (req, res) => {
  //extraer los campos
  const { idGame } = req.params;
  const { email } = req.body
  try {

    const [[game]] = await pool.query("SELECT title FROM games WHERE id = ?", [
      idGame,
    ]);
    console.log(game);
    
    const [result] = await pool.query("DELETE FROM games WHERE id = ?", [
      idGame,
    ]);

    if (result.affectedRows == 1) {
      
      let emailHTML = `<p> Por motivos hemos decidido borrar tu juego <b>${game.title}</b></p> `;

      await sendMail(email, "NovaGames Account", emailHTML);
      res.status(200).json({ message: "Juego eliminado" });
    } else {
      res.status(400).json({ message: "Juego no eliminado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el juego" });
  }
};
