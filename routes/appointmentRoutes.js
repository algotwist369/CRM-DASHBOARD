const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ================== Public Routes (No Authentication Required) ==================

// Get business information for booking (by businessLink)
router.get("/business/:businessLink/info", appointmentController.getBusinessForBooking);

// Get business information for booking (by businessId - for testing)
router.get("/business/:businessId/info", appointmentController.getBusinessForBookingById);

// Get available time slots (by businessLink)
router.get("/business/:businessLink/slots", appointmentController.getAvailableSlots);

// Get available time slots (by businessId - for testing)
router.get("/business/:businessId/slots", appointmentController.getAvailableSlotsById);

// Book appointment (by businessLink)
router.post("/business/:businessLink/book", appointmentController.bookAppointment);

// Book appointment (by businessId - for testing)
router.post("/book", appointmentController.bookAppointmentById);

// Get appointment by confirmation code
router.get("/confirmation/:confirmationCode", appointmentController.getAppointmentByCode);

// Cancel appointment
router.post("/confirmation/:confirmationCode/cancel", appointmentController.cancelAppointment);

// ================== Manager Routes (Authentication Required) ==================

// Get appointments for manager's business
router.get("/", 
    authMiddleware, 
    roleMiddleware(["manager"]),
    appointmentController.getAppointments
);

// Update appointment status
router.put("/:appointmentId/status", 
    authMiddleware, 
    roleMiddleware(["manager"]),
    appointmentController.updateAppointmentStatus
);

module.exports = router;
