const express = require("express");
const router = express.Router();
const {
    createFreeListing,
    getAllFreeListings,
    getFreeListingById,
    updateFreeListing,
    deleteFreeListing
} = require("../controller/freeListing.controller");
const { uploadMultiple, handleUploadError } = require("../utils/uploadFiles");

// Listing Routes
router.post("/create", uploadMultiple("documents", 10), handleUploadError, createFreeListing);
router.get("/", getAllFreeListings);
router.get("/:id", getFreeListingById);
router.put("/:id", uploadMultiple("documents", 10), handleUploadError, updateFreeListing);
router.delete("/:id", deleteFreeListing);

module.exports = router;
