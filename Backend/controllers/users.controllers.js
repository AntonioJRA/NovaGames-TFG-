import { pool } from "../db.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM users");
    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
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

export const updateProfile = async (req, res) => {
  try {
    const { username, profile_image, password, role } = req.body;
    const { id } = req.params;

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
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      campos.push("password = ?");
      valores.push(hashedPassword); // Recuerda hashearla si hace falta
    }
    const rolesPermitidos = ["user", "developer", "admin"];
    if (role && rolesPermitidos.includes(role)) {
      campos.push("role = ?");
      valores.push(role);
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

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      id,
    ]);

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

export const autorizarRol=(rolesPermitidos)=>{
  return (req,res,next)=>{
    if(!rolesPermitidos.includes(req.user.role)){
      return res.status(403).json({message: 'No tiene permiso para acceder a esta ruta'})
    }
    next();
  }
}