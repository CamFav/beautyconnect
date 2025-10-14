const express = require("express");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { getDashboard } = require("../controllers/proController");
const {
  updateAvailability,
  getAvailability,
} = require("../controllers/proAvailability.controller");
const { getAvailableSlots } = require("../controllers/proSlots.controller");

const router = express.Router();

// GET /api/pro/dashboard - réservé à role pro
router.get("/dashboard", protect, requireRole("pro"), getDashboard);

// Mettre à jour les dispos AVEC LE BON CONTROLLER
router.put("/:proId/availability", updateAvailability);

// Récupérer les dispos AVEC LE BON CONTROLLER
router.get("/:proId/availability", getAvailability);

// Consulter les créneaux générés
router.get("/:proId/slots", getAvailableSlots);

module.exports = router;
