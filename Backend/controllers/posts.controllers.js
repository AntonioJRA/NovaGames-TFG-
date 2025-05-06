import { pool } from "../db.js";

export const getAllPosts = async (req, res) => {
  const {idGame} = req.body
  try {
    const [result] = await pool.query(
      `
      SELECT * FROM posts WHERE game_id = ? ORDER BY post_date ASC
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

export const getPost = async (req, res) => {
  const {idGame} = req.body
  const {id} = req.params

  try {
    const [result] = await pool.query(
      `
      SELECT * FROM posts WHERE game_id = ? AND id = ?
      `
      ,[idGame,id]
    );

    if(result.length === 0) return res.status(200).json({message:'No existe la publicación'});

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

