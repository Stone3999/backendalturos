const mysql = require("mysql2");

// Crear un pool de conexiones
const pool = mysql.createPool({
  host: 'sql3.freesqldatabase.com',
  user: 'sql3769348',
  password: 'ywW7bMR65H',
  database: 'sql3769348',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000 // Mantén esto si quieres
});

// Probar conexión una vez (opcional)
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conectando al pool MySQL:", err);
  } else {
    console.log("✅ Conectado al pool de base de datos MySQL");
    connection.release();
  }
});

module.exports = pool;
