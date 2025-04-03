const express = require("express");
const router = express.Router();
const db = require("../database");  // Asegúrate de que el archivo de base de datos esté bien configurado

// Ruta para obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM vista_productos"; // Cambia 'vista_productos_admin' si es necesario
    const [productos] = await db.promise().query(query);
    res.json(productos);
  } catch (error) {
    console.error("Error obteniendo productos:", error.message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});



// Ruta para obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM vista_productos_admin"; // Cambia 'vista_productos_admin' si es necesario
    const [productos] = await db.promise().query(query);
    res.json(productos);
  } catch (error) {
    console.error("Error obteniendo productos:", error.message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});


// Ruta para obtener todos los productos desde la vista vista_productos
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM vista_productos";  // Usamos la vista para obtener los productos
    const [productos] = await db.promise().query(query);  // Ejecutamos la consulta
    res.json(productos);  // Enviamos los resultados como respuesta
  } catch (error) {
    console.error("Error obteniendo productos:", error.message);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Ruta para actualizar los detalles del producto
router.put("/producto/:id", async (req, res) => {
  const { id } = req.params;  // Obtenemos el ID del producto
  const { prod_nom, prod_desc, prod_precio, prod_stock } = req.body;  // Obtenemos los detalles desde el cuerpo de la solicitud

  // Verificar si los valores proporcionados son válidos
  if (
    !prod_nom ||
    !prod_desc ||
    !prod_precio ||
    isNaN(prod_precio) ||
    isNaN(prod_stock)
  ) {
    return res.status(400).json({ error: "Datos inválidos para la actualización" });
  }

  try {
    const query = `
      UPDATE producto
      SET prod_nom = ?, prod_desc = ?, prod_precio = ?, prod_stock = ? 
      WHERE prod_id = ?
    `;
    const [result] = await db.promise().query(query, [prod_nom, prod_desc, prod_precio, prod_stock, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado para actualizar" });
    }

    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error.message);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});


// Ruta para obtener un producto específico por su ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "SELECT * FROM vista_productos WHERE prod_id = ?";
    const [producto] = await db.promise().query(query, [id]);

    if (producto.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto[0]);  // Enviamos los datos del producto
  } catch (error) {
    console.error("Error obteniendo el producto:", error.message);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// Ruta para agregar un producto al carrito
router.post("/carrito", async (req, res) => {
  const { us_id, prod_id, car_cantidad } = req.body;

  try {
    const query = `
      INSERT INTO Carrito (us_id, prod_id, car_cantidad)
      VALUES (?, ?, ?)
    `;
    await db.promise().query(query, [us_id, prod_id, car_cantidad]);
    res.status(201).json({ message: "Producto agregado al carrito correctamente" });
  } catch (error) {
    console.error("Error al agregar al carrito:", error.message);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});





module.exports = router;