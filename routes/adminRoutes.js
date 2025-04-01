const express = require("express");
const router = express.Router();
const db = require("../database");  // Asegúrate de importar la conexión de la base de datos

// Ruta para obtener todos los usuarios desde la vista `vista_usuarios_admin`
router.get("/usuarios", async (req, res) => {
  try {
    const query = "SELECT * FROM vista_usuarios_admin"; // Usamos la vista para obtener los usuarios
    const [usuarios] = await db.promise().query(query);  // Ejecutamos la consulta
    res.json(usuarios);  // Enviamos los resultados como respuesta
  } catch (error) {
    console.error("Error obteniendo usuarios:", error.message);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Ruta para actualizar los datos de un usuario
router.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { us_tipo, us_status, us_nomb, us_apep, us_apem } = req.body; // Datos a actualizar

  try {
    // Llamamos al procedimiento almacenado para editar el usuario
    const query = "CALL editar_usuario(?, ?, ?, ?, ?, ?)";
    const [result] = await db.promise().query(query, [id, us_tipo, us_status, us_nomb, us_apep, us_apem]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Usuario actualizado correctamente", user: result[0] });
    } else {
      res.status(400).json({ error: "No se pudo actualizar el usuario" });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Ruta para eliminar un usuario
router.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM usuario WHERE id_us = ?";
    await db.promise().query(query, [id]);
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

router.get("/ventas", async (req, res) => {
  try {
    const query = `
      SELECT v.vent_id, v.us_id, v.prod_id, v.vent_fecha, v.vent_total, p.prod_nom
      FROM ventas v
      JOIN producto p ON v.prod_id = p.prod_id
    `;
    const [ventas] = await db.promise().query(query);
    res.json(ventas);
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error.message);
    res.status(500).json({ error: "Error al obtener ventas" });
  }
});

// Ruta para obtener todos los dispositivos
router.get("/dispositivos", async (req, res) => {
  try {
    // Realizar un JOIN con la tabla 'usuario' para obtener el nombre del usuario
    const query = `
      SELECT d.dis_id, d.dis_codigo, d.us_id, d.dis_bat, d.dis_stat, u.us_nomb
      FROM dispositivo d
      JOIN usuario u ON d.us_id = u.id_us
    `;
    const [dispositivos] = await db.promise().query(query);  // Ejecutamos la consulta

    console.log(dispositivos); // Muestra los dispositivos en la consola del servidor

    res.json(dispositivos);  // Enviamos los resultados como respuesta
  } catch (error) {
    console.error("Error obteniendo dispositivos:", error.message);
    res.status(500).json({ error: "Error al obtener dispositivos" });
  }
});



module.exports = router;
