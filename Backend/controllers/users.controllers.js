import { pool } from "../db.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM users ORDER BY username ASC"
    );
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const id  = req.user.id;
    const [[result]] = await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    if (!result) return res.status(200).json("No existe el usuario");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener alumnos", error: error.message });
  }
};

export const upgradeUserToDeveloper = async (req, res) => {
  try {
    const id = req.user.id;

    const [result] = await pool.query(
      "UPDATE users SET role = 'developer' WHERE id = ?",
      [id]
    );

    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "El usuario no existe",
      });
    } else {
      return res.status(200).json({
        message: "El usuario ha ascendido a \"Developer\"",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const downgradeDeveloperToUser = async (req, res) => {
  try {
    const id = req.user.id;

    const [result] = await pool.query(
      "UPDATE users SET role = 'user' WHERE id = ?",
      [id]
    );

    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "El usuario no existe",
      });
    } else {
      return res.status(200).json({
        message: "El usuario ha descendido a \"User\"",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const updateNovapoints = async (req, res) => {
  try {
    const id = req.user.id;
    const { rewards } = req.body

    const [result] = await pool.query(
      "UPDATE users SET novapoints = novapoints + ? WHERE id = ?",
      [rewards, id]
    );

    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "El usuario no existe",
      });
    } else {
      return res.status(200).json({
        message: "El usuario ha sido actualizado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { idUser, role } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, idUser]
    );

    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "El usuario no existe",
      });
    } else {
      return res.status(200).json({
        message: "El usuario ha sido actualizado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { idUser } = req.body;
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [idUser]);

    if (result.affectedRows == 0) {
      return res.status(400).json({
        message: "El usuario no existe",
      });
    } else {
      return res.status(200).json({
        message: "El usuario ha sido borrado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, profile_image } = req.body;
    const id = req.user.id;

    const campos = [];
    const valores = [];

    if (username) {
      campos.push("username = ?");
      valores.push(username);
    }
    if (profile_image) {
      campos.push("profile_image = ?");
      valores.push(profile_image);
    }

    if (campos.length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }

    valores.push(id); // para el WHERE

    const [result] = await pool.query(
      `UPDATE users SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "El usuario no existe" });
    }

    return res
      .status(200)
      .json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { password, repeatPassword } = req.body;
    const id = req.user.id;

    if (password && repeatPassword) {
      if (password === repeatPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
          `UPDATE users SET password = ? WHERE id = ?`,
          [hashedPassword, id]
        );

        if (result.affectedRows == 0) {
          return res.status(400).json({
            message: "El usuario no existe",
          });
        } else {
          return res.status(200).json({
            message: "Contraseña actualizada",
          });
        }
      } else {
        return res
          .status(200)
          .json({ message: "Las contraseñas no coinciden. Intente de nuevo" });
      }
    } else {
      return res
        .status(200)
        .json({ message: "Por favor, introduzca password y repeatPassword" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const getVotesByUser = async (req, res) => {
  const id  = req.user.id;
  try {
    const [result] = await pool.query(
      `
      SELECT gjv.* FROM game_jam_votes AS gjv
      JOIN game_jams AS gj ON gjv.game_jam_id = gj.id
      WHERE gjv.user_id = ? AND gj.is_open = TRUE
      `,
      [id]
    );
    if (!result) return res.status(200).json("Actualmente no tienes ningún voto");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener votos", error: error.message });
  }
};