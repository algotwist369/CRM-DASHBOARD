/**
 * FILE UPLOAD USAGE EXAMPLES
 * 
 * This file shows how to use the uploadFiles utility in your routes/controllers
 */

const express = require("express");
const router = express.Router();
const { uploadSingle, uploadMultiple, uploadFields, processUploadedFiles, handleUploadError } = require("../utils/uploadFiles");

// ============================================
// EXAMPLE 1: Single File Upload
// ============================================
router.post("/upload-single", uploadSingle("file"), handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const files = processUploadedFiles(req);
        
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: files[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message
        });
    }
});

// ============================================
// EXAMPLE 2: Multiple Files Upload
// ============================================
router.post("/upload-multiple", uploadMultiple("files", 10), handleUploadError, async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        const files = processUploadedFiles(req);
        
        res.status(200).json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            data: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message
        });
    }
});

// ============================================
// EXAMPLE 3: Multiple Fields Upload
// ============================================
router.post("/upload-fields", uploadFields([
    { name: "documents", maxCount: 5 },
    { name: "images", maxCount: 3 }
]), handleUploadError, async (req, res) => {
    try {
        const files = processUploadedFiles(req);
        
        res.status(200).json({
            success: true,
            message: "Files uploaded successfully",
            data: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Upload failed",
            error: error.message
        });
    }
});

// ============================================
// EXAMPLE 4: Upload with Form Data (Free Listing)
// ============================================
router.post("/free-listing-with-files", uploadMultiple("documents", 10), handleUploadError, async (req, res) => {
    try {
        // Process uploaded files
        const uploadedFiles = processUploadedFiles(req);
        const fileUrls = uploadedFiles.map(file => file.url);

        // Get other form data
        const listingData = {
            companyName: req.body.companyName,
            phoneNumber: req.body.phoneNumber,
            // ... other fields
            documents: fileUrls // Store file URLs in database
        };

        // Save to database
        // const listing = await FreeListing.create(listingData);

        res.status(201).json({
            success: true,
            message: "Free listing created with documents",
            data: {
                listing: listingData,
                files: uploadedFiles
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create listing",
            error: error.message
        });
    }
});

module.exports = router;

