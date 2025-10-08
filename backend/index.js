require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User.js");
const xss = require('xss-clean');
const helmet = require('helmet');
const { protect } = require('./middleware/auth');

const app = express();


app.disable('x-powered-by');

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(xss());

// Configuration de Helmet avec CSP
const isDev = process.env.NODE_ENV !== 'production';

app.use(
  helmet({
    contentSecurityPolicy: isDev
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "http://localhost:5173"],
            connectSrc: ["'self'", "http://localhost:5173", "ws://localhost:5173"],
            imgSrc: ["'self'", "data:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "data:"],
          },
        }
      : {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
            imgSrc: ["'self'"],
            styleSrc: ["'self'"],
            fontSrc: ["'self'"],
          },
        },
  })
);

// Les routes doivent venir après Helmet/XSS
app.use('/api/auth', require('./routes/auth'));

// Connexion à MongoDB
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connecté"))
    .catch(err => console.error("Erreur de connexion MongoDB:", err));
}
// Route racine
app.get("/", (req, res) => {
  res.json({
    status: "success",
    service: "BeautyConnect API",
    message: "Connecté à BeautyConnect"
  });
});

// Route /api/health (état de l'API et MongoDB)
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;

  res.json({
    status: "ok",
    service: "BeautyConnect API",
    database: dbState === 1 ? "connected" : "disconnected",
    uptime: process.uptime()
  });
});

// Liste les utilisateurs
app.get("/api/users", protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bloque la création d'utilisateurs via /api/users
app.post("/api/users", protect, async (req, res) => {
  res.status(403).json({ message: "Création via /api/users interdite. Utilisez /api/auth/register." });
});

app.use('/api/account', require('./routes/account'));
app.use('/api/pro', require('./routes/pro'));


module.exports = app;

