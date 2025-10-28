const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const validate = require("../middleware/validate");
const { body, param } = require("express-validator");
const {
  createReservation,
  getByClient,
  getByPro,
  updateStatus,
} = require("../controllers/reservations/reservation.controller");

// Anti-injection générique
const allowOnly = (allowedKeys, data) => {
  for (const key of Object.keys(data)) {
    if (!allowedKeys.includes(key)) delete data[key];
  }
};

// ========================================
// POST /api/reservations
// ========================================
router.post(
  "/",
  protect,
  [
    body("serviceId").isMongoId().withMessage("serviceId invalide"),
    body("proId").notEmpty().isMongoId().withMessage("proId invalide"),
    body("date").notEmpty().isISO8601().withMessage("Date invalide (ISO 8601)"),
    body("time")
      .notEmpty()
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("Heure invalide (HH:MM)"),
    body("location").optional(),
    body("notes").optional().trim().escape(),
  ],
  validate,
  (req, res, next) => {
    allowOnly(
      ["serviceId", "proId", "date", "time", "location", "notes"],
      req.body
    );
    next();
  },
  createReservation
);

// ========================================
// GET /api/reservations/client/:clientId
// ========================================
router.get(
  "/client/:clientId",
  protect,
  requireRole("client"),
  [param("clientId").isMongoId().withMessage("clientId invalide")],
  validate,
  (req, res, next) => {
    if (req.user.id !== req.params.clientId) {
      return res.status(403).json({
        message: "Accès refusé",
        errors: [
          {
            field: "authorization",
            message: "Vous ne pouvez voir que vos réservations",
          },
        ],
      });
    }
    next();
  },
  getByClient
);

// ========================================
// GET /api/reservations/pro/:proId
// ========================================
router.get(
  "/pro/:proId",
  protect,
  requireRole("pro"),
  [param("proId").isMongoId().withMessage("proId invalide")],
  validate,
  (req, res, next) => {
    if (req.user.id !== req.params.proId) {
      return res.status(403).json({
        message: "Accès refusé",
        errors: [
          {
            field: "authorization",
            message: "Vous ne pouvez voir que vos réservations",
          },
        ],
      });
    }
    next();
  },
  getByPro
);

// ========================================
// PATCH /api/reservations/:id/status
// ========================================
router.patch(
  "/:id/status",
  protect,
  [
    param("id").isMongoId().withMessage("ID de réservation invalide"),
    body("status")
      .notEmpty()
      .isIn([
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "confirmed",
        "completed",
      ])
      .withMessage("Statut invalide"),
  ],
  validate,
  (req, res, next) => {
    allowOnly(["status"], req.body);
    next();
  },
  updateStatus
);

module.exports = router;
