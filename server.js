const express = require("express");
const cors = require("cors");
const loginRoutes = require("./routes/loginRoutes");
const productosRoutes = require("./routes/productosRoutes");
const adminRoutes = require("./routes/adminRoutes");
const carroRoutes = require("./routes/carroRoutes");
const app = express();

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// CORS configuration
app.use(cors({
  origin: ["https://alturos-seven.vercel.app", "http://localhost:3000"], // Permite tanto el dominio de producción como el local
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true // Enable credentials for cart session management
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies

// Routes configuration
app.use("/api/auth", loginRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/carro", carroRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server" });
});

// Get the port from the environment (use 5000 for local development)
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
