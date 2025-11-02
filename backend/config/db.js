const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
  const mongoURI =
    process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL;
  if (!mongoURI) {
    console.error("MONGODB_URI non défini dans .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
      family: 4,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("MongoDB connecté avec succès");
    }
  } catch (err) {
    console.error(`Erreur de connexion MongoDB: ${err.message}`);
    if (retries > 0) {
      console.log(
        `Nouvelle tentative dans ${delay / 1000}s... (${retries - 1} restantes)`
      );
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error(
        "Impossible de se connecter à MongoDB après plusieurs essais."
      );
      process.exit(1);
    }
  }

  mongoose.connection.on("connected", () => console.log("[Mongo] connecté"));
  mongoose.connection.on("disconnected", () =>
    console.warn("[Mongo] déconnecté")
  );
  mongoose.connection.on("error", (err) =>
    console.error("[Mongo] erreur:", err)
  );
};

module.exports = connectDB;
