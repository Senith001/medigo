const express = require("express");

const {
  createSession,
  getSessionById,
  getSessionByAppointmentId,
  joinSession,
  updateSession,
  updateSessionStatus,
  deleteSession,
} = require("../controllers/telemedicineController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("doctor", "admin"), createSession);
router.get(
  "/appointment/:appointmentId",
  protect,
  authorize("patient", "doctor", "admin"),
  getSessionByAppointmentId
);
router.get("/:id", protect, authorize("patient", "doctor", "admin"), getSessionById);
router.put(
  "/:id/join",
  protect,
  authorize("patient", "doctor", "admin"),
  joinSession
);
router.put(
  "/:id",
  protect,
  authorize("doctor", "admin"),
  updateSession
);
router.put(
  "/:id/status",
  protect,
  authorize("doctor", "admin"),
  updateSessionStatus
);
router.delete(
  "/:id",
  protect,
  authorize("doctor", "admin"),
  deleteSession
);

module.exports = router;
