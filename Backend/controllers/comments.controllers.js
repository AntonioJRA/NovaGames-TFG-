import { pool } from "../db.js";

export const getCommentsFromGame = async (req, res) => {
  const { idGame } = req.body
  try {
    const [result] = await pool.query(
      `
      SELECT * FROM comments WHERE game_id = ?
      `
      ,[idGame]
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las publicaciones", error: error.message });
  }
};

export const getCommentsFromPost = async (req, res) => {
  const { idPost } = req.body
  try {
    const [result] = await pool.query(
      `
      SELECT * FROM comments WHERE post_id = ?
      `
      ,[idPost]
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las publicaciones", error: error.message });
  }
};
