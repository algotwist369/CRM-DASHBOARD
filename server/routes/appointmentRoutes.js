const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// All routes require authentication (Admin or Manager)
router.use(authMiddleware, roleMiddleware(["admin", "manager"]));

// ================== Appointment Management ==================

// Create new appointment
router.post("/", appointmentController.createAppointment);

// Get appointments with filtering and pagination
router.get("/", appointmentController.getAppointments);

// Get appointment statistics
router.get("/stats", appointmentController.getAppointmentStats);

// Get appointment by ID
router.get("/:id", appointmentController.getAppointmentById);

// Update appointment
router.put("/:id", appointmentController.updateAppointment);

// ================== Appointment Actions ==================

// Confirm appointment
router.post("/:id/confirm", appointmentController.confirmAppointment);

// Start appointment (customer checked in)
router.post("/:id/start", appointmentController.startAppointment);

// Complete appointment
router.post("/:id/complete", appointmentController.completeAppointment);

// Cancel appointment
router.post("/:id/cancel", appointmentController.cancelAppointment);

// Reschedule appointment
router.post("/:id/reschedule", appointmentController.rescheduleAppointment);

// Mark as no-show
router.post("/:id/no-show", appointmentController.markNoShow);

// Add review to appointment
router.post("/:id/review", appointmentController.addReview);

module.exports = router;
