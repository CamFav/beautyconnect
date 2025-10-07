require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User.js");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

// Connexion à MongoDB
mongoose
.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connecté"))
.catch(err => console.error("Erreur de connexion MongoDB:", err));

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

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Route POST pour créer un utilisateur
app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});
