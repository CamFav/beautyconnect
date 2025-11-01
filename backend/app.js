require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const compression = require("compression");

const app = express();
app.disable("x-powered-by");

const isDev = process.env.NODE_ENV !== "production";

// ========================================
// CORS
// ========================================
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      allowedOrigins.length > 0
        ? allowedOrigins
        : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// ========================================
// Logging HTTP (morgan + fichier local)
// ========================================
if (isDev) {
  app.use(morgan("dev"));
} else {
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const logStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
    flags: "a",
  });
  app.use(morgan("combined", { stream: logStream }));
}

// ========================================
// Helmet + CSP
// ========================================
app.use(
  helmet({
    contentSecurityPolicy: isDev
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "http://localhost:5173"],
            connectSrc: [
              "'self'",
              "http://localhost:5173",
              "ws://localhost:5173",
              "http://localhost:5000",
            ],
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

// ========================================
// Rate limiter global et admin renforcé
// ========================================
let adminLimiter;

if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Trop de requêtes depuis cette IP. Réessayez plus tard.",
  });
  app.use("/api/", limiter);

  adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1h
    max: 100,
    message: "Accès admin trop fréquent. Réessayez plus tard.",
  });

  console.log("Rate limiter actif (production)");
} else {
  adminLimiter = (req, res, next) => next();
  console.log("Rate limiter désactivé en mode développement");
}

// ========================================
// XSS + JSON parsing limité
// ========================================
app.use(xss());
app.use(express.json({ limit: "10kb" }));

// ========================================
// Compression + Cache static pour le frontend
// ========================================
app.use(compression());

const frontendPath = path.join(__dirname, "dist");
if (fs.existsSync(frontendPath)) {
  app.use(
    express.static(frontendPath, {
      maxAge: "1y",
      etag: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          // Ne pas mettre en cache les fichiers HTML
          res.setHeader("Cache-Control", "no-cache");
        } else {
          // Cache fort pour les assets (js, css, images…)
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );

  // Fallback pour le routage SPA
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ========================================
// Routes principales
// ========================================
require("./routes/router")(app);

// ========================================
// Connexion MongoDB
// ========================================
const connectDB = require("./config/db");
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// ========================================
// Routes de base
// ========================================
app.get("/", (req, res) => {
  res.json({
    status: "success",
    service: "BeautyConnect API",
    env: process.env.NODE_ENV,
    message: "Connecté à BeautyConnect",
  });
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    status: "ok",
    service: "BeautyConnect API",
    database: dbState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

// ========================================
// Route admin sécurisée
// ========================================
app.get("/admin/fix-users", adminLimiter, async (req, res) => {
  const providedKey = req.headers["x-admin-key"] || req.query.key;

  if (!providedKey || providedKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: "Accès refusé : clé invalide" });
  }

  const User = require("./models/User");

  try {
    const all = await User.find();
    for (const u of all) {
      if (!u.role && u.activeRole) {
        u.role = u.activeRole;
        await u.save();
        console.log(`ROLE corrigé pour ${u.email} => role=${u.role}`);
      }
    }
    res.json({ message: "Correction terminée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = app;
