import { pool } from "../db.js";

export const getAllPosts = async (req, res) => {
  const {id} = req.params
  try {
    const [result] = await pool.query(
      `
      SELECT * FROM posts WHERE game_id = ? ORDER BY post_date DESC
      `
      ,[id]
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las publicaciones", error: error.message });
  }
};

export const getPost = async (req, res) => {
  const {id} = req.params

  try {
    const [result] = await pool.query(
      `
      SELECT p.*, g.title FROM posts AS p 
      JOIN games as g
      WHERE p.id = ? && p.game_id = g.id
      `
      ,[id]
    );

    if(result.length === 0) return res.status(200).json({message:'No existe la publicación'});

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const addPost = async (req, res) => {
  const idUser = req.user.id;
  const { idGame, title, content } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO posts (game_id, developer_id, title, content) VALUES (?,?,?,?)",
      [idGame, idUser, title, content]
    );

    if (result.affectedRows == 1) {
      res.status(201).json({ message: "Publicación creada con éxito" });
    } else {
      res.status(400).json({ message: "Error al crear la publicación" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};