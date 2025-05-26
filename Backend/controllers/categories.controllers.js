import { pool } from "../db.js";

export const getCategories = async (req, res) => {
  try {
    const [result] = await pool.query(
      `
      SELECT * FROM categories
      `
    );

    if(result.length === 0) return res.status(200).json({message:'No existen categorias'});

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};