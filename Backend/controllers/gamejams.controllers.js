import { pool } from "../db.js";

export const getLastGameJam = async (req, res) => {
  const id = req.user.id;
  try {
    const [result] = await pool.query(
      "SELECT * FROM game_jams WHERE is_open = TRUE"
    );

    if(result.length === 0) {
      const [result] = await pool.query(
        "SELECT * FROM game_jams WHERE is_open = TRUE"
      );
    }


    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};
