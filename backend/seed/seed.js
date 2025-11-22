/**
 * BeautyConnect deterministic seeder
 * - Fonctionne en local ou sur Mongo Atlas (Render, etc.)
 * - Crée un jeu d'utilisateurs DEMO (@demo.local) : pros + clients
 * - Génère profils pro, services, posts et réservations réalistes
 *
 * Usage :
 *   NODE_ENV=production node backend/seed/seed.js
 *
 * Variables :
 *   MONGODB_URI / MONGO_URL : URI Mongo cible (Atlas, local…)
 *   SEED_CLEAR=1            : supprime les anciens comptes @demo.local avant d'insérer
 */

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../config/db");
const User = require("../models/User");
const ProDetails = require("../models/ProDetails");
const Post = require("../models/Post");
const Reservation = require("../models/Reservation");

const atlasUri =
  process.env.MONGO_ATLAS_URI ||
  process.env.MONGO_ATLAS_URL ||
  process.env.ATLAS_URI ||
  process.env.MONGODB_ATLAS_URI;
if (atlasUri) {
  process.env.MONGODB_URI = atlasUri;
  const host = atlasUri.includes("@")
    ? atlasUri.split("@")[1]
    : atlasUri.replace(/\/\/([^@]+)@/, "//***@");
  console.log(`[seed] Cible Mongo Atlas: ${host}`);
}

const EMAIL_DOMAIN = "@demo.local";
const DEFAULT_PASSWORD = "Password123!";

const cityPool = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Bordeaux",
  "Nice",
  "Lille",
  "Strasbourg",
  "Nantes",
  "Montpellier",
];

const PRO_TEMPLATES = [
  {
    key: "coiffure_paris",
    name: "Camille Bernard",
    businessName: "Atelier Camille Coiffure",
    email: `camille.bernard${EMAIL_DOMAIN}`,
    category: "Coiffure",
    city: "Paris",
    address: "27 Rue des Martyrs, 75009 Paris",
    status: "salon",
    experience: "5+ ans",
    services: [
      { name: "Coupe femme", duration: 45, price: 42 },
      { name: "Coupe homme", duration: 30, price: 28 },
      { name: "Coloration complète", duration: 90, price: 95 },
    ],
  },
  {
    key: "tatouage_lyon",
    name: "Nicolas Durant",
    businessName: "Studio Ink Durant",
    email: `nicolas.durant${EMAIL_DOMAIN}`,
    category: "Tatouage",
    city: "Lyon",
    address: null,
    status: "freelance",
    experience: "2+ ans",
    services: [
      { name: "Session tattoo 2h", duration: 120, price: 220 },
      { name: "Micro tattoo", duration: 60, price: 110 },
    ],
  },
  {
    key: "maquillage_marseille",
    name: "Mila Rami",
    businessName: "Glow by Mila",
    email: `mila.rami${EMAIL_DOMAIN}`,
    category: "Maquillage",
    city: "Marseille",
    address: null,
    status: "freelance",
    experience: "5+ ans",
    services: [
      { name: "Maquillage mariage", duration: 90, price: 150 },
      { name: "Cours maquillage", duration: 60, price: 80 },
    ],
  },
  {
    key: "esthetique_toulouse",
    name: "Sarah Dupuis",
    businessName: "Maison Esthétique Dupuis",
    email: `sarah.dupuis${EMAIL_DOMAIN}`,
    category: "Esthetique",
    city: "Toulouse",
    address: "108 Avenue Jean-Jaurès, 31000 Toulouse",
    status: "salon",
    experience: "2+ ans",
    services: [
      { name: "Soin visage glow", duration: 60, price: 70 },
      { name: "Manucure complète", duration: 45, price: 40 },
    ],
  },
  {
    key: "coiffure_bordeaux",
    name: "Léo Martin",
    businessName: null,
    email: `leo.martin${EMAIL_DOMAIN}`,
    category: "Coiffure",
    city: "Bordeaux",
    address: null,
    status: "freelance",
    experience: "1 an",
    services: [
      { name: "Fade + barbe", duration: 45, price: 35 },
      { name: "Coupe enfant", duration: 30, price: 22 },
    ],
  },
  {
    key: "tatouage_paris",
    name: "Aya Rahimi",
    businessName: "Atelier Aya Ink",
    email: `aya.rahimi${EMAIL_DOMAIN}`,
    category: "Tatouage",
    city: "Paris",
    address: "8 Passage Briare, 75012 Paris",
    status: "salon",
    experience: "5+ ans",
    services: [
      { name: "Linework minimal", duration: 60, price: 120 },
      { name: "Session personnalisée 3h", duration: 180, price: 320 },
    ],
  },
  {
    key: "massage_nice",
    name: "Inès Vega",
    businessName: "Nomade Wellness",
    email: `ines.vega${EMAIL_DOMAIN}`,
    category: "Esthétique",
    city: "Nice",
    address: "7 Avenue Jean Médecin, 06000 Nice",
    status: "freelance",
    experience: "5+ ans",
    exerciseType: ["domicile", "exterieur"],
    services: [
      { name: "Massage deep tissue", duration: 60, price: 85 },
      { name: "Massage relaxant à domicile", duration: 75, price: 95 },
      { name: "Massage express 30min", duration: 30, price: 45 },
    ],
  },
  {
    key: "onglerie_lille",
    name: "Sofia Caron",
    businessName: "Atelier Nails & Art",
    email: `sofia.caron${EMAIL_DOMAIN}`,
    category: "Esthétique",
    city: "Lille",
    address: "12 Rue de la Barre, 59800 Lille",
    status: "salon",
    experience: "3+ ans",
    services: [
      { name: "Pose complète gel", duration: 90, price: 70 },
      { name: "Remplissage + nail art", duration: 75, price: 60 },
      { name: "Manucure express", duration: 30, price: 25 },
    ],
  },
  {
    key: "spa_strasbourg",
    name: "Elena Vogel",
    businessName: "Stras Spa Botanica",
    email: `elena.vogel${EMAIL_DOMAIN}`,
    category: "Esthétique",
    city: "Strasbourg",
    address: "4 Quai des Bateliers, 67000 Strasbourg",
    status: "salon",
    experience: "5+ ans",
    services: [
      { name: "Rituel hammam + gommage", duration: 70, price: 80 },
      { name: "Soin corps au monoï", duration: 60, price: 72 },
    ],
  },
  {
    key: "makeup_nantes",
    name: "Anaëlle Girod",
    businessName: "Glow Atelier Nantes",
    email: `anaelle.girod${EMAIL_DOMAIN}`,
    category: "Maquillage",
    city: "Nantes",
    address: null,
    status: "freelance",
    experience: "4+ ans",
    exerciseType: ["domicile", "exterieur"],
    services: [
      { name: "Maquillage shooting", duration: 60, price: 110 },
      { name: "Maquillage soirée", duration: 45, price: 70 },
      { name: "Cours beauté du teint", duration: 60, price: 80 },
    ],
  },
  {
    key: "barbier_rennes",
    name: "Marc Azoulay",
    businessName: "Barber Lab Rennes",
    email: `marc.azoulay${EMAIL_DOMAIN}`,
    category: "Coiffure",
    city: "Rennes",
    address: "18 Rue du Chapitre, 35000 Rennes",
    status: "salon",
    experience: "2+ ans",
    services: [
      { name: "Taille de barbe premium", duration: 30, price: 28 },
      { name: "Coupe + barbe prestige", duration: 60, price: 55 },
    ],
  },
  {
    key: "photo_montpellier",
    name: "Noa Perrot",
    businessName: "Studio Beauty Shots",
    email: `noa.perrot${EMAIL_DOMAIN}`,
    category: "Autre",
    city: "Montpellier",
    address: null,
    status: "freelance",
    experience: "3+ ans",
    exerciseType: ["exterieur"],
    services: [
      { name: "Session portrait 1h", duration: 60, price: 130 },
      { name: "Pack highlight réseaux", duration: 90, price: 210 },
    ],
  },
];

const CLIENT_TEMPLATES = [
  { name: "Lucas Petit", city: "Paris" },
  { name: "Emma Lefort", city: "Lyon" },
  { name: "Hugo Marchand", city: "Marseille" },
  { name: "Clara Besson", city: "Toulouse" },
  { name: "Sami Benali", city: "Bordeaux" },
  { name: "Lina Moreau", city: "Paris" },
  { name: "Paul Nguyen", city: "Lyon" },
  { name: "Nora Leclerc", city: "Marseille" },
  { name: "Yanis Fernandez", city: "Nice" },
  { name: "Zoé Laurent", city: "Lille" },
  { name: "Ethan Blanchet", city: "Nantes" },
  { name: "Léa Costa", city: "Montpellier" },
  { name: "Maël Roussel", city: "Strasbourg" },
  { name: "Camila Duarte", city: "Nice" },
  { name: "Alexis Moretti", city: "Paris" },
  { name: "Nina Roche", city: "Bordeaux" },
  { name: "Isaac Fontaine", city: "Rennes" },
  { name: "Salomé Ventura", city: "Toulouse" },
  { name: "Victor Hugo", city: "Lille" },
  { name: "Aya Benyamina", city: "Marseille" },
  { name: "Milo Garnier", city: "Montpellier" },
  { name: "Chloé Serrano", city: "Nice" },
].map((template) => ({
  ...template,
  email: `${template.name.toLowerCase().replace(/[^a-z]/g, ".")}@demo.local`.replace(/\.+/g, "."),
}));

function loadImageCatalog() {
  const file = path.join(__dirname, "images.json");
  if (!fs.existsSync(file)) return {};
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    console.warn("[seed] Impossible de lire images.json :", err.message);
    return {};
  }
}
const imagesCatalog = loadImageCatalog();

const DEFAULT_HEADERS = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
];

function fallbackAvatar(seed, size = 400) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
}

function weeklyAvailability() {
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days.map((day) => ({
    day,
    enabled: true,
    slots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "18:00" },
    ],
  }));
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function normalizeCategory(category) {
  const allowed = (Post.schema?.path("category")?.enumValues || []).map((c) => ({
    raw: c,
    norm: c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
  }));
  const target = String(category || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const match = allowed.find((c) => c.norm === target);
  return match ? match.raw : allowed[0] || "other";
}

function sentenceForCategory(category) {
  const dict = {
    Coiffure: [
      "Nouvelle coupe tendance pour la saison",
      "Brushing lumineux realise ce matin",
      "Transformation couleur avant/apres",
    ],
    Tatouage: [
      "Linework minimaliste termine",
      "Projet floral en noir et gris",
      "Tatouage personalisé pour un client fidele",
    ],
    Esthetique: [
      "Soin visage glow effect en cabine",
      "Routine bien-etre personnalisee",
      "Manucure nude elegante du jour",
    ],
    Maquillage: [
      "Maquillage mariee lumineux",
      "Smoky eyes pour une soiree",
      "Look naturel et frais",
    ],
  };
  const list = dict[category] || ["Inspiration du jour."];
  return list[Math.floor(Math.random() * list.length)];
}

const isTruthy = (value) =>
  typeof value !== "undefined" &&
  value !== null &&
  ["1", "true", "yes", "on"]
    .includes(String(value).trim().toLowerCase());

async function resetDatabase() {
  const dbName = mongoose.connection?.db?.databaseName || "(inconnu)";
  console.warn(`[seed] RESET DB demandé -> drop de "${dbName}"`);
  try {
    await mongoose.connection.dropDatabase();
    console.log(`[seed] Base "${dbName}" réinitialisée (dropDatabase).`);
  } catch (err) {
    console.error("[seed] Impossible de dropDatabase :", err.message);
    throw err;
  }
}

async function clearDemoData() {
  const regex = new RegExp(`${EMAIL_DOMAIN.replace(/\./g, "\\.")}$`, "i");
  const users = await User.find({ email: { $regex: regex } }, { _id: 1 }).lean();
  if (!users.length) return { users: 0, posts: 0, reservations: 0, details: 0 };
  const ids = users.map((u) => u._id);
  const [resReservations, resPosts, resDetails, resUsers] = await Promise.all([
    Reservation.deleteMany({ $or: [{ proId: { $in: ids } }, { clientId: { $in: ids } }] }),
    Post.deleteMany({ provider: { $in: ids } }),
    ProDetails.deleteMany({ proId: { $in: ids } }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);
  return {
    users: resUsers.deletedCount || 0,
    posts: resPosts.deletedCount || 0,
    reservations: resReservations.deletedCount || 0,
    details: resDetails.deletedCount || 0,
  };
}

async function ensureUser(payload) {
  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = new User(payload);
  } else {
    Object.assign(user, payload);
    user.markModified("proProfile");
  }
  user.password = payload.password || DEFAULT_PASSWORD;
  await user.save();
  return user;
}

async function seedPros() {
  const results = [];
  for (const template of PRO_TEMPLATES) {
    const avatarList = imagesCatalog?.avatars?.pro;
    const headerList = imagesCatalog?.headers?.pro;
    const avatar = Array.isArray(avatarList) && avatarList.length ? avatarList[template.category ? template.category.length % avatarList.length : 0] : fallbackAvatar(template.key);
    const header =
      Array.isArray(headerList) && headerList.length
        ? headerList[Math.floor(Math.random() * headerList.length)]
        : DEFAULT_HEADERS[Math.floor(Math.random() * DEFAULT_HEADERS.length)];
    const businessName =
      template.businessName ||
      (template.status === "salon"
        ? template.businessName || `${template.city} ${template.category || "Pro"}`.trim()
        : template.name);
    const userLocation = { city: template.city, country: "France" };
    const addressValue =
      template.status === "salon"
        ? template.address || `${template.city}, France`
        : template.address || "";

    const exerciseModes =
      Array.isArray(template.exerciseType) && template.exerciseType.length
        ? template.exerciseType
        : template.status === "salon"
        ? ["salon"]
        : ["domicile", "exterieur"];

    const user = await ensureUser({
      name: template.name,
      email: template.email,
      role: "pro",
      activeRole: "pro",
      avatarPro: avatar,
      location: userLocation,
      proProfile: {
        businessName,
        siret: String(10000000000000 + Math.floor(Math.random() * 9000000000000)).slice(0, 14),
        status: template.status,
        exerciseType: exerciseModes,
        experience: template.experience,
        headerImage: header,
        location: { city: template.city, country: "France", address: addressValue },
        categories: [template.category],
      },
    });

    await ProDetails.findOneAndUpdate(
      { proId: user._id },
      { proId: user._id, services: template.services, availability: weeklyAvailability() },
      { upsert: true, new: true }
    );

    results.push({ user, template });
  }
  return results;
}

async function seedClients() {
  const results = [];
  for (const template of CLIENT_TEMPLATES) {
    const avatarList = imagesCatalog?.avatars?.client;
    const avatar =
      Array.isArray(avatarList) && avatarList.length
        ? avatarList[Math.floor(Math.random() * avatarList.length)]
        : fallbackAvatar(template.email, 300);

    const user = await ensureUser({
      name: template.name,
      email: template.email,
      role: "client",
      activeRole: "client",
      avatarClient: avatar,
      location: {
        city: template.city,
        country: "France",
        address: template.address || `${template.city}, France`,
      },
    });
    results.push(user);
  }
  return results;
}

async function seedPosts(pros) {
  const payloads = [];
  for (const { user, template } of pros) {
    const images = imagesCatalog?.posts?.[template.category] || [];
    const postsPerPro = template.postsCount ?? 6;
    for (let i = 0; i < postsPerPro; i++) {
      const media =
        images[i % images.length] ||
        `https://picsum.photos/seed/${encodeURIComponent(template.key + i)}/900/700`;
      payloads.push({
        provider: user._id,
        mediaUrl: media,
        description: sentenceForCategory(template.category),
        category: normalizeCategory(template.category),
      });
    }
  }
  shuffle(payloads);
  for (const doc of payloads) {
    await Post.create(doc);
  }
  return payloads.length;
}

async function seedReservations(clients, pros) {
  let total = 0;
  const today = new Date();
  for (const client of clients) {
    const bookings = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < bookings; i++) {
      const entry = pros[Math.floor(Math.random() * pros.length)];
      if (!entry) continue;
      const pro = entry.user;
      const details = await ProDetails.findOne({ proId: pro._id }).lean();
      if (!details?.services?.length) continue;
      const service = details.services[Math.floor(Math.random() * details.services.length)];
      const date = new Date(today.getTime() + 86400000 * (i + 2));
      const dateStr = date.toISOString().slice(0, 10);
      const slotPool = ["09:00", "10:30", "14:00", "15:30"];
      const taken = await Reservation.find({ proId: pro._id, date: dateStr }, { time: 1 }).lean();
      const availableSlots = slotPool.filter(
        (slot) => !taken.some((res) => res.time === slot)
      );
      if (!availableSlots.length) continue;
      const time = availableSlots[Math.floor(Math.random() * availableSlots.length)];

      await Reservation.create({
        clientId: client._id,
        proId: pro._id,
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
        date: dateStr,
        time,
        location: client.location?.city || "Paris",
        status: Math.random() > 0.3 ? "accepted" : "pending",
      });
      total++;
    }
  }
  return total;
}

async function verifySeed() {
  const regex = new RegExp(`${EMAIL_DOMAIN.replace(/\./g, "\\.")}$`, "i");
  const [userCount, proCount, clientCount, postCount, reservationCount] = await Promise.all([
    User.countDocuments({ email: { $regex: regex } }),
    User.countDocuments({ email: { $regex: regex }, role: "pro" }),
    User.countDocuments({ email: { $regex: regex }, role: "client" }),
    Post.countDocuments({}),
    Reservation.countDocuments({}),
  ]);

  console.log("[seed] Totaux -> users:", userCount, "| pros:", proCount, "| clients:", clientCount);
  console.log("[seed] Posts:", postCount, "| Reservations:", reservationCount);
}

(async () => {
  try {
    await connectDB();

    const shouldResetDb = isTruthy(process.env.SEED_RESET_DB || process.env.SEED_RESET);
    const shouldClearDemo = isTruthy(process.env.SEED_CLEAR);

    if (shouldResetDb) {
      await resetDatabase();
    } else if (shouldClearDemo) {
      console.log("[seed] Suppression des comptes demo...");
      const cleared = await clearDemoData();
      console.log("[seed] Supprimé :", cleared);
    }

    console.log("[seed] Création des professionnels...");
    const pros = await seedPros();
    console.log(`[seed] ${pros.length} pros prêts.`);

    console.log("[seed] Création des clients...");
    const clients = await seedClients();
    console.log(`[seed] ${clients.length} clients prêts.`);

    console.log("[seed] Génération des posts...");
    const posts = await seedPosts(pros);
    console.log(`[seed] ${posts} posts générés.`);

    console.log("[seed] Génération des réservations...");
    const reservations = await seedReservations(clients, pros);
    console.log(`[seed] ${reservations} réservations insérées.`);

    await verifySeed();

    await mongoose.connection.close();
    console.log("[seed] Terminé.");
    process.exit(0);
  } catch (err) {
    console.error("[seed] Erreur :", err);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
})();
