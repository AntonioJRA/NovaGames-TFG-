import { pool } from "../db.js";
/*

{
  "idGame": 2,
  "game": [
    { "title": "Título 2", "cover": "img1.jpg", "download_url": "http://url1.com" }
  ],
  "categories": [2,5],
  "blocks": [
    { "block_type": "text", "content": "Contenido 1", "order_index": 1 },
    { "block_type": "image", "content": "img3.jpg", "order_index": 2 }
  ]
}

*/
export const updateSectionGame = async (req, res) => {
  const { idGame, game, categories, blocks } = req.body;

  console.log(req.body);
  if (!idGame) {
    return res.status(400).json({ message: "idGame is required" });
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

  if (fields.length === 0) {
    throw new Error("No hay campos para actualizar");
  }

  values.push(idGame); // Para el WHERE

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
    const values = categories.map(cat => [idGame, cat]); // [[1, 'accion'], [1, 'puzzle']]
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
    const values = blocks.map(block => [
      idGame,
      block.block_type,
      block.content,
      block.order_index
    ]);

    const sql = `
      INSERT INTO content_blocks (game_id, block_type, content, order_index)
      VALUES ?
    `;
    await pool.query(sql, [values]);
  }
};

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