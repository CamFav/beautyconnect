require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const xss = require('xss-clean');
const helmet = require('helmet');

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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


require('./routes/router')(app);

// Connexion à MongoDB
const connectDB = require('./config/db');
if (process.env.NODE_ENV !== "test") {
  connectDB();
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

// Route temporaire pour corriger les utilisateurs
app.get("/admin/fix-users", async (req, res) => {
  const User = require("./models/User"); // adapte si ton chemin est différent

  try {
    const all = await User.find();
    for (const u of all) {
      // Correction du champ role si manquant
      if (!u.role && u.activeRole) {
        u.role = u.activeRole;
        await u.save();
        console.log(`ROLE corrigé pour ${u.email} => role=${u.role}`);
      }
    }
    res.json({ message: "Correction terminée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = app;
