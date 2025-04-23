import { pool } from "../db.js";

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

export const getGamesByUser = async (req, res) => {
  const idUser = req.user.id;
  try {
    const [result] = await pool.query(
      "SELECT * FROM games WHERE developer_id = ?",
      [idUser]
    );

    if (result.length === 0)
      return res.status(404).json("Aún no has creado ningún juego");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juego", error: error.message });
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
