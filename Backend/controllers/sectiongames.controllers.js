import { pool } from "../db.js";

/*
{
  "idGame": 120,
  "game": [
    {
      "title": "Luis Super Sta",
      "download_url": "https://prueba.com",
      "description": "Esto es una descripcion",
      "cover": "luisSS.png"
    }
  ],
  "categories": [9],
  "blocks": [
    {
      "image_name": "imagen1.png",
      "content": "Primer bloque de contenido"
    },
    {
      "image_name": "imagen2.jpg",
      "content": "Segundo bloque con otro contenido"
    }
  ]
}
*/
export const updateSectionGame = async (req, res) => {
  const { idGame, game, categories, blocks } = req.body;

  if (!idGame) {
    return res.status(400).json({ message: "idGame es requerido" });
  }

  try {
    const result = await updateGame(idGame, game[0]);
    await updateGameCategories(idGame, categories);
    await updateGameBlocks(idGame, blocks);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Juego no encontrado" });
    }
    res.json({ message: "Juego actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar juego", error: err });
  }
};

const updateGame = async (idGame, gameData) => {
  const fields = [];
  const values = [];

  if (gameData.title !== undefined) {
    fields.push("title = ?");
    values.push(gameData.title);
  }
  if (gameData.download_url !== undefined) {
    fields.push("download_url = ?");
    values.push(gameData.download_url);
  }
  if (gameData.cover !== undefined) {
    fields.push("cover = ?");
    values.push(gameData.cover);
  }
  if (gameData.description !== undefined) {
    fields.push("description = ?");
    values.push(gameData.description);
  }

  if (fields.length === 0) {
    return res.status(200).json({ message: "No hay campos que actualizar" });
  }

  values.push(idGame);

  const sql = `UPDATE games SET ${fields.join(", ")} WHERE id = ?`;

  const [result] = await pool.query(sql, values);
  return result;
};

const updateGameCategories = async (idGame, categories) => {
  if (!Array.isArray(categories)) {
    throw new Error("categories debe ser un array");
  }

  // Borrar categorías actuales
  await pool.query("DELETE FROM game_categories WHERE game_id = ?", [idGame]);

  // Insertar nuevas (si hay)
  if (categories.length > 0) {
    const values = categories.map((cat) => [idGame, cat]); // [[1, 'accion'], [1, 'puzzle']]
    const sql = "INSERT INTO game_categories (game_id, category_id) VALUES ?";
    await pool.query(sql, [values]);
  }
};

const updateGameBlocks = async (idGame, blocks) => {
  if (!Array.isArray(blocks)) {
    throw new Error("blocks debe ser un array");
  }

  // Borrar bloques actuales
  await pool.query("DELETE FROM content_blocks WHERE game_id = ?", [idGame]);

  // Insertar nuevos (si hay)
  if (blocks.length > 0) {
    const values = blocks.map((block) => [
      idGame,
      block.image_name,
      block.content,
    ]);

    const sql = `
      INSERT INTO content_blocks (game_id, image_name, content)
      VALUES ?
    `;
    await pool.query(sql, [values]);
  }
};

export const getContentBlocks = async (req, res) => {
  const { id } = req.params;
  try {

    if (!id)
      return res.status(200).json({ message: "Proporciona el ID del juego" });

    const [result] = await pool.query(
      `
      SELECT * FROM content_blocks WHERE game_id = ?
      `,
      [id]
    );

    if (result.length === 0)
      return res.status(200).json({ message: "La seccion está vacía o no existe el juego" });

    return res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getGameCategories = async (req, res) => {
  const { id } = req.params;
  try {

    if (!id)
      return res.status(200).json({ message: "Proporciona el ID del juego" });

    const [result] = await pool.query(
      `
      SELECT gc.game_id, c.id, c.name 
      FROM game_categories as gc
      JOIN categories AS c ON gc.category_id = c.id
      WHERE gc.game_id = ?
      `,
      [id]
    );

    if (result.length === 0)
      return res.status(200).json({ message: "La seccion está vacía o no existe el juego" });

    return res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};
