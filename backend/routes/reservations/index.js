const express = require("express");
const {
  createReservation,
  getByClient,
  getByPro,
  updateStatus,
} = require("../../controllers/reservation.controller");

const router = express.Router();

router.post("/", createReservation);
router.get("/client/:clientId", getByClient);
router.get("/pro/:proId", getByPro);
router.patch("/:id/status", updateStatus);

module.exports = router;
