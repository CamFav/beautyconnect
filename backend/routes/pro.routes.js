const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const requireRole = require("../middleware/roles");
const validate = require("../middleware/validate");
const { body, param } = require("express-validator");

const { getDashboard } = require("../controllers/pro/dashboard.controller");
const availabilityController = require("../controllers/pro/availability.controller");
const slotsController = require("../controllers/pro/slots.controller");
const servicesController = require("../controllers/pro/services.controller");

// Helper async pour éviter les plantages silencieux
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ========================================
// GET /api/pro/dashboard
// ========================================
router.get(
  "/dashboard",
  protect, // Vérifie et extrait req.user depuis le JWT
  requireRole("pro"), // N’autorise que les utilisateurs avec rôle "pro"
  asyncHandler(getDashboard)
);

// ========================================
// SERVICES
// ========================================
router.get(
  "/services",
  protect,
  requireRole("pro"),
  asyncHandler(servicesController.getMyServices)
);

router.post(
  "/services",
  protect,
  requireRole("pro"),
  [
    body("name").trim().escape().notEmpty().withMessage("Nom requis"),
    body("price").isNumeric().withMessage("Prix invalide"),
    body("duration").isNumeric().withMessage("Durée invalide"),
  ],
  validate,
  asyncHandler(servicesController.createService)
);

router.put(
  "/services/:serviceId",
  protect,
  requireRole("pro"),
  [
    param("serviceId").isMongoId().withMessage("ID de service invalide"),
    body("name").optional().trim().escape(),
    body("price").optional().isNumeric(),
    body("duration").optional().isNumeric(),
  ],
  validate,
  asyncHandler(servicesController.updateService)
);

router.delete(
  "/services/:serviceId",
  protect,
  requireRole("pro"),
  [param("serviceId").isMongoId().withMessage("ID de service invalide")],
  validate,
  asyncHandler(servicesController.deleteService)
);

// ========================================
// GET /api/pro/:proId/services/public
// ========================================
router.get(
  "/:proId/services/public",
  [param("proId").isMongoId().withMessage("ID pro invalide")],
  validate,
  asyncHandler(servicesController.getPublicServices)
);

// ========================================
// AVAILABILITY
// ========================================
router.put(
  "/availability",
  protect,
  requireRole("pro"),
  asyncHandler(availabilityController.updateAvailability)
);

router.get(
  "/availability",
  protect,
  requireRole("pro"),
  asyncHandler(availabilityController.getAvailability)
);

// ========================================
// SLOTS (client consulte les créneaux d’un pro)
// ========================================
router.get(
  "/:proId/slots",
  protect,
  requireRole("client"), // accès client seulement
  [param("proId").isMongoId().withMessage("ID pro invalide")],
  validate,
  asyncHandler(slotsController.getAvailableSlots)
);

module.exports = router;
