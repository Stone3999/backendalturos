const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Asegúrate de que esta línea esté aquí
const router = express.Router();
const db = require("../database");

// Constantes
const SALT_ROUNDS = 10;
const USER_STATUS_ACTIVE = 1;
const USER_LOGGED_OUT = 0;

// Validaciones
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$/;
  return passwordRegex.test(password);
};

// 🔹 REGISTRO DE USUARIO
router.post("/register", async (req, res) => {
  try {
    const { us_tipo, us_nomb, us_apep, us_apem, us_mail, us_pass } = req.body;

    // Validar campos requeridos
    if (!us_tipo || !us_nomb || !us_apep || !us_mail || !us_pass) {
      return res.status(400).json({ error: "❌ Todos los campos son obligatorios" });
    }

    // Validar formato de email
    if (!validateEmail(us_mail)) {
      return res.status(400).json({ error: "❌ Formato de correo electrónico inválido" });
    }

    // Validar la contraseña
    if (!validatePassword(us_pass)) {
      return res.status(400).json({
        error: "❌ La contraseña debe tener al menos 8 caracteres, 1 número y 1 carácter especial.",
      });
    }

    // Verificar si el correo ya existe
    const [existingUsers] = await db.promise().query(
      "SELECT 1 FROM usuario WHERE us_mail = ? LIMIT 1", 
      [us_mail]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "❌ El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(us_pass, SALT_ROUNDS);
    
    // Insertar usuario
    const insertUserQuery = `
      INSERT INTO usuario (us_tipo, us_status, us_nomb, us_apep, us_apem, us_mail, us_pass, us_logged) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.promise().query(insertUserQuery, [
      us_tipo, 
      USER_STATUS_ACTIVE, 
      us_nomb, 
      us_apep, 
      us_apem || null, // Manejar apellido materno opcional
      us_mail, 
      hashedPassword, 
      USER_LOGGED_OUT
    ]);

    return res.status(201).json({ 
      success: true,
      message: "✅ Usuario registrado correctamente" 
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ 
      success: false,
      error: "❌ Error interno del servidor" 
    });
  }
});


// Ruta de login
router.post("/login", async (req, res) => {
  const { us_mail, us_pass } = req.body;

  if (!us_mail || !us_pass) {
    return res.status(400).json({ error: "❌ Correo y contraseña son obligatorios" });
  }

  try {
    const [results] = await db.promise().query("SELECT * FROM usuario WHERE us_mail = ?", [us_mail]);

    if (results.length === 0) {
      return res.status(400).json({ error: "❌ Usuario no encontrado" });
    }

    const user = results[0];

    // Verificar si ya hay una sesión activa
    if (user.us_logged === 1) {
      return res.status(400).json({ error: "❌ Ya hay una sesión activa para este usuario" });
    }

    const isMatch = await bcrypt.compare(us_pass, user.us_pass);

    if (!isMatch) {
      return res.status(400).json({ error: "❌ Contraseña incorrecta" });
    }

    // Iniciar sesión: Cambiar us_logged a 1
    await db.promise().query("UPDATE usuario SET us_logged = 1 WHERE id_us = ?", [user.id_us]);

    const token = jwt.sign(
      { id: user.id_us, email: user.us_mail, tipo: user.us_tipo },
      "secreto_super_seguro",
      { expiresIn: "2h" }
    );

    res.json({
      message: "✅ Inicio de sesión exitoso",
      token,
      user: {
        id: user.id_us,
        nombre: user.us_nomb,
        apellido: user.us_apep,
        email: user.us_mail,
        tipo: user.us_tipo,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "❌ Error interno del servidor" });
  }
});


router.post("/logout", async (req, res) => {
  const { userId } = req.body; // El ID del usuario se debe obtener del JWT o del cuerpo de la solicitud

  if (!userId) {
    return res.status(400).json({ error: "❌ ID de usuario requerido" });
  }

  try {
    // Actualizar el valor de us_logged a 0 cuando el usuario cierre sesión
    await db.promise().query("UPDATE usuario SET us_logged = 0 WHERE id_us = ?", [userId]);

    res.json({ message: "✅ Cierre de sesión exitoso" });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({ error: "❌ Error interno del servidor" });
  }
});



module.exports = router;
