const express = require("express");
const router = express.Router();
const db = require("../database");  // Asegúrate de que el archivo de base de datos esté bien configurado

// Ruta para agregar un producto al carrito
router.post("/carrito", async (req, res) => {
  const { us_id, prod_id, car_cantidad } = req.body;  // Usamos el id del usuario, id del producto y cantidad

  try {
    // Verificamos si el producto ya está en el carrito para el usuario
    const [existingProduct] = await db.promise().query(
      "SELECT * FROM carrito WHERE us_id = ? AND prod_id = ?",  
      [us_id, prod_id]
    );

    if (existingProduct.length > 0) {
      // Si el producto ya está en el carrito, actualizamos la cantidad
      const newQuantity = existingProduct[0].car_cantidad + car_cantidad;
      const updateQuery = "UPDATE carrito SET car_cantidad = ? WHERE us_id = ? AND prod_id = ?";  // Cambié "Carrito" a "carrito"
      await db.promise().query(updateQuery, [newQuantity, us_id, prod_id]);
      return res.status(200).json({ message: "Producto actualizado en el carrito" });
    }

    // Si el producto no está en el carrito, lo agregamos
    const query = "INSERT INTO carrito (us_id, prod_id, car_cantidad) VALUES (?, ?, ?)";  // Cambié "Carrito" a "carrito"
    await db.promise().query(query, [us_id, prod_id, car_cantidad]);

    res.status(201).json({ message: "Producto agregado al carrito correctamente" });
  } catch (error) {
    console.error("Error al agregar al carrito:", error.message);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
});

// Ruta para obtener los productos en el carrito de un usuario
// Ruta para obtener los productos en el carrito de un usuario
router.get("/:us_id", async (req, res) => {
  const { us_id } = req.params;

  try {
    const query = `
      SELECT p.prod_id, p.prod_nom, p.prod_precio, p.prod_img1, p.prod_stock, c.car_cantidad, (p.prod_precio * c.car_cantidad) AS total_precio
      FROM carrito c
      JOIN producto p ON c.prod_id = p.prod_id
      WHERE c.us_id = ?
    `;
    const [productosCarrito] = await db.promise().query(query, [us_id]);

    if (productosCarrito.length === 0) {
      return res.status(200).json({ message: "No hay productos en el carrito.", productos: [] });
    }

    res.json({ message: "Productos encontrados", productos: productosCarrito });
  } catch (error) {
    console.error("Error obteniendo productos del carrito:", error.message);
    res.status(500).json({ error: "Error al obtener los productos del carrito" });
  }
});


  // Ruta para agregar un producto al carrito
  router.post("/agregar", async (req, res) => {
    const { us_id, prod_id, car_cantidad } = req.body;
  
    try {
      // Verificamos si el producto ya está en el carrito para el usuario
      const [existingProduct] = await db.promise().query(
        "SELECT * FROM carrito WHERE us_id = ? AND prod_id = ?",
        [us_id, prod_id]
      );
  
      if (existingProduct.length > 0) {
        // Si el producto ya está en el carrito, actualizamos la cantidad
        const newQuantity = existingProduct[0].car_cantidad + car_cantidad;
        const updateQuery = "UPDATE carrito SET car_cantidad = ? WHERE us_id = ? AND prod_id = ?";
        await db.promise().query(updateQuery, [newQuantity, us_id, prod_id]);
        return res.status(200).json({ message: "Producto actualizado en el carrito" });
      }
  
      // Si el producto no está en el carrito, lo agregamos
      const query = "INSERT INTO carrito (us_id, prod_id, car_cantidad) VALUES (?, ?, ?)";
      await db.promise().query(query, [us_id, prod_id, car_cantidad]);
  
      res.status(201).json({ message: "Producto agregado al carrito correctamente" });
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error.message);
      res.status(500).json({ error: "Error al agregar producto al carrito" });
    }
  });
  
  // Ruta para disminuir la cantidad de un producto en el carrito
  router.post("/disminuir", async (req, res) => {
    const { us_id, prod_id } = req.body;
  
    try {
      const query = `
        UPDATE carrito
        SET car_cantidad = car_cantidad - 1
        WHERE us_id = ? AND prod_id = ? AND car_cantidad > 1
      `;
      await db.promise().query(query, [us_id, prod_id]);
      res.status(200).json({ message: "Cantidad disminuida correctamente" });
    } catch (error) {
      console.error("Error al disminuir cantidad:", error.message);
      res.status(500).json({ error: "Error al disminuir cantidad" });
    }
  });
  
  // Ruta para eliminar un producto del carrito
  router.delete("/eliminar/:us_id/:prod_id", async (req, res) => {
    const { us_id, prod_id } = req.params;
  
    try {
      const query = "DELETE FROM carrito WHERE us_id = ? AND prod_id = ?";
      await db.promise().query(query, [us_id, prod_id]);
      res.status(200).json({ message: "Producto eliminado del carrito correctamente" });
    } catch (error) {
      console.error("Error al eliminar producto del carrito:", error.message);
      res.status(500).json({ error: "Error al eliminar producto del carrito" });
    }
  });
  
  // Ruta para proceder al pago
  router.post("/pagar", async (req, res) => {
    const { us_id } = req.body;
    console.log("📦 Procesando pago para usuario:", us_id);
  
    try {
      // 🔍 Verificar si hay productos en el carrito
      const [productos] = await db.promise().query("SELECT * FROM carrito WHERE us_id = ?", [us_id]);
  
      if (productos.length === 0) {
        return res.status(400).json({ error: "No tienes productos en el carrito" });
      }
  
      // 🧾 Insertar en ventas con total
      const insertVentasQuery = `
        INSERT INTO ventas (us_id, prod_id, vent_fecha, vent_total)
        SELECT c.us_id, c.prod_id, NOW(), (c.car_cantidad * p.prod_precio)
        FROM carrito c
        JOIN producto p ON c.prod_id = p.prod_id
        WHERE c.us_id = ?
      `;
  
      try {
        const [insertResult] = await db.promise().query(insertVentasQuery, [us_id]);
        console.log("✅ Insert en ventas completado:", insertResult);
      } catch (insertErr) {
        console.error("❌ ERROR en insert de ventas:", insertErr.message);
        return res.status(500).json({ error: "Error al registrar ventas" });
      }
  
      // 📉 Disminuir el stock
      const reducirStockQuery = `
        UPDATE producto p
        JOIN carrito c ON p.prod_id = c.prod_id
        SET p.prod_stock = GREATEST(p.prod_stock - c.car_cantidad, 0)
        WHERE c.us_id = ?
      `;
      await db.promise().query(reducirStockQuery, [us_id]);
  
      // 🧼 Vaciar carrito
      await db.promise().query("DELETE FROM carrito WHERE us_id = ?", [us_id]);
  
      res.status(200).json({ message: "✅ Compra procesada, stock actualizado y carrito vaciado" });
    } catch (error) {
      console.error("❌ Error general al procesar el pago:", error.message);
      res.status(500).json({ error: "Error al procesar el pago" });
    }
  });

  module.exports = router;
