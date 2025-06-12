import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import { sendMail } from "../mailer.js";

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
    const id = req.user.id;
    const [[result]] = await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    return res.status(200).json(result);

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
        message: 'El usuario ha ascendido a "Developer"',
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
        message: 'El usuario ha descendido a "User"',
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
    const { rewards } = req.body;

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

export const temporalyBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET unban_date = DATE_ADD(NOW(), INTERVAL 1 MONTH) WHERE id = ?",
      [id]
    );

    const [[user]] = await pool.query(
      "SELECT unban_date FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    const fechaCompleta = user.unban_date;
    const soloFecha = fechaCompleta.toISOString().split("T")[0];
    const soloHora = fechaCompleta.toISOString().split("T")[1].split(".")[0];

    if (result.affectedRows > 0) {
      let emailHTML = `<p>Tu cuenta ha sido suspendida por comportamiento inadecuado hasta el día <b>${soloFecha}</b> a las <b>${soloHora}</b></p> `;

      await sendMail(email, "NovaGames Account", emailHTML);
      return res.status(200).json({
        message: "Usuario baneado con éxito",
      });
    } else {
      return res.status(400).json({
        message: "Error al banear el usuario",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
    console.log(error);
  }
};

export const temporalyUnbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET unban_date = NULL WHERE id = ? AND unban_date IS NOT NULL",
      [id]
    );

    if (result.affectedRows > 0) {
      let emailHTML = `<p>Hemos desbloqueado el acceso a su cuenta</b></p> `;

      await sendMail(email, "NovaGames Account", emailHTML);
      return res.status(200).json({
        message: "Usuario desbaneado con éxito",
      });
    } else {
      return res.status(400).json({
        message: "El usuario no estaba baneado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
    console.log(error);
  }
};

export const permanentlyBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET is_banned = TRUE, unban_date = NULL WHERE id = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      let emailHTML = `<p>Por motivos hemos decidido bloquear tu cuenta <b>permanentemente</b></p> `;

      await sendMail(email, "NovaGames Account", emailHTML);
      return res.status(200).json({
        message: "Usuario baneado con éxito",
      });
    } else {
      return res.status(400).json({
        message: "Error al banear el usuario",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const permanentlyUnbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET is_banned = FALSE WHERE id = ? AND is_banned = TRUE",
      [id]
    );

    if (result.affectedRows > 0) {
      let emailHTML = `<p>Hemos decidivo volver a activar su cuenta</p> `;

      await sendMail(email, "NovaGames Account", emailHTML);
      return res.status(200).json({
        message: "Usuario baneado con éxito",
      });
    } else {
      return res.status(400).json({
        message: "El usuario no estaba baneado",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error en el servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    console.log(result);

    if (result.affectedRows == 0) {
      return res.status(404).json({
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
  const { email, password, repeatPassword } = req.body;
  // const id = req.user.id;
  try {

    if (password && repeatPassword) {
      if (password === repeatPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
          `UPDATE users SET password = ? WHERE email = ?`,
          [hashedPassword, email]
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
  const id = req.user.id;
  try {
    const [result] = await pool.query(
      `
      SELECT gjv.* FROM game_jam_votes AS gjv
      JOIN game_jams AS gj ON gjv.game_jam_id = gj.id
      WHERE gjv.user_id = ? AND gj.is_open = TRUE
      `,
      [id]
    );
    if (!result)
      return res.status(200).json("Actualmente no tienes ningún voto");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener votos", error: error.message });
  }
};
