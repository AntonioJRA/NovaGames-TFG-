import { pool } from "../db.js";

export const getAllGames = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM games");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juegos", error: error.message });
  }
};

export const getGame = async (req, res) => {
  try {
    const { id } = req.params;
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

export const getGamesByUser = async (req, res) => {
  try {
    const { idUser } = req.params;
    const [result] = await pool.query(
      "SELECT * FROM games WHERE developer_id = ?",
      [idUser]
    );
    if (result.length === 0) return res.status(404).json("Aún no has creado ningún juego");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juego", error: error.message });
  }
};

export const getGamesByFilter = async (req, res) => {
  const { category, ratingOrder, dateFilter } = req.query;
  console.log(category);
  try {
    let query = "SELECT * FROM games WHERE 1=1";
    let params = [];

    // Filtro por categoría
    if (category) {
      query += `  AND genre_id = ?`;
      params.push(category);
    }

    // Filtro por fecha
    if (dateFilter === "week") {
      query += ` AND upload_date >= NOW() - INTERVAL 7 DAY`;
    } else if (dateFilter === "month") {
      query += ` AND upload_date >= NOW() - INTERVAL 1 MONTH`;
    } else if (dateFilter === "year") {
      query += ` AND upload_date >= NOW() - INTERVAL 1 YEAR`;
    }

    // Orden por valoración
    if (ratingOrder === "asc" || ratingOrder === "desc") {
      query += ` ORDER BY rating ${ratingOrder.toUpperCase()}`;
    }

    const [result] = await pool.query(query, params);

    if (result.length === 0)
      return res.status(404).json("No existe ningún juego");

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener juego", error: error.message });
  }
};

export const addAlumno = async (req, res) => {
  try {
    console.log(req.body);
    const { nomApe, idCurso } = req.body;

    const [result] = await pool.query(
      "INSERT INTO alumnos (apellidosNombre, idCurso) VALUES (?,?)",
      [nomApe, idCurso]
    );
    console.log(result);

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const updateAlumno = async (req, res) => {
  try {
    console.log(req.body);
    const { nomApe, idCurso } = req.body;
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE alumnos SET apellidosNombre=?, idCurso=? WHERE idAlumno=?",
      [nomApe, idCurso, id]
    );
    //const [result]=await pool.query("UPDATE alumnos SET apellidosNombre=IFNULL(?,apellidosNombre), idCurso=IFNULL(?, idCurso) WHERE idAlumno=?", [nomApe, idCiclo, id]);

    console.log(result);
    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "El Alumno no existe",
      });
    } else {
      return res.status(200).json({
        message: "El Alumno ha sido actualizado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const updatePatchAlumno = async (req, res) => {
  try {
    console.log(req.body);
    const { nomApe, idCurso } = req.body;
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE alumnos SET apellidosNombre=IFNULL(?,apellidosNombre), idCurso=IFNULL(?, idCurso) WHERE idAlumno=?",
      [nomApe, idCurso, id]
    );

    console.log(result);
    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "no existe",
      });
    } else {
      return res.status(200).json({
        message: "ha sido actualizado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const delAlumno = async (req, res) => {
  try {
    console.log({ req });
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM alumnos WHERE idAlumno=?", [
      id,
    ]);
    console.log("borrado", result);
    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "no existe",
      });
    } else {
      return res.status(200).json({
        message: "ha sido borrado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};
