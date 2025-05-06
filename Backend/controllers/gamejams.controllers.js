import { pool } from "../db.js";

export const getLastGameJamData = async (req, res) => {
  try {
    const [[result]] = await pool.query(
      `
      SELECT gj.*, u.username, g.title FROM game_jams AS gj 
      JOIN users AS u ON gj.winner_id = u.id
      JOIN games AS g ON g.developer_id = u.id
      WHERE is_last = TRUE
      `
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getLastGameJamGames = async (req, res) => {
  try {
    const [[lastJam]] = await pool.query(
      "SELECT id FROM game_jams WHERE is_last = TRUE"
    );

    const [result] = await pool.query(
      `
      SELECT g.* FROM games AS g
      JOIN games_game_jams AS ggj ON ggj.game_id = g.id
      JOIN game_jams AS gj ON ggj.game_jam_id = gj.id
      WHERE ggj.game_jam_id = ? AND g.id != gj.winning_game_id
      ORDER BY ggj.average_score DESC, RAND()
      LIMIT 10
      `,
      [lastJam.id]
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getActiveGameJam = async (req, res) => {
  try {
    const now = new Date();

    const [result] = await pool.query(
      `
      SELECT * FROM game_jams
      WHERE is_open = true
      LIMIT 1
      `,
      [now, now]
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getGameJamLimit = async (req, res) => {
  try {
    const [result] = await pool.query(
      `
      SELECT * FROM game_jams
      WHERE is_open = FALSE AND winner_id IS NOT NULL
      ORDER BY voting_end DESC
      LIMIT 5
      `
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getSearchedGameFromJam = async (req, res) => {
  const { searchedGame, idJam } = req.body;
  try {
    const [result] = await pool.query(
      `
      SELECT g.* FROM games AS g
      JOIN games_game_jams AS ggj ON g.id = ggj.game_id
      WHERE title LIKE ? AND ggj.game_jam_id = ?
      `,
      [`%${searchedGame}%`, idJam]
    );

    if (result.length === 0)
      return res.status(200).json({ message: "No se encontraron resultados" });

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getGamesFromGameJamLimit = async (req, res) => {
  const { idJam } = req.body;
  try {
    const [result] = await pool.query(
      `
      SELECT g.* FROM games AS g
      JOIN games_game_jams AS ggj ON g.id = ggj.game_id
      WHERE ggj.game_jam_id = ?
      ORDER BY RAND()
      LIMIT 30
      `,
      [idJam]
    );

    if (result.length === 0)
      return res.status(200).json({ message: "No se encontraron resultados" });

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

