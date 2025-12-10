const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload directory configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default

// Allowed file types (from .env or default)
const getAllowedFileTypes = () => {
    const envTypes = process.env.ALLOWED_FILE_TYPES;
    if (envTypes) {
        return envTypes.split(",").map(type => type.trim().toLowerCase());
    }
    // Default allowed types
    return ["jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx", "txt"];
};

// Create upload directory if it doesn't exist
const ensureUploadDir = (subDir = "") => {
    const fullPath = path.join(UPLOAD_DIR, subDir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
};

// Initialize upload directories
ensureUploadDir();
ensureUploadDir("documents");
ensureUploadDir("images");
ensureUploadDir("temp");

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine subdirectory based on file type
        const fileType = file.mimetype.split("/")[0]; // 'image', 'application', etc.
        let subDir = "documents";
        
        if (fileType === "image") {
            subDir = "images";
        }
        
        const uploadPath = ensureUploadDir(subDir);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, "-");
        const filename = `${nameWithoutExt}-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedTypes = getAllowedFileTypes();
    const fileExt = path.extname(file.originalname).toLowerCase().replace(".", "");
    
    if (allowedTypes.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error(`File type .${fileExt} is not allowed. Allowed types: ${allowedTypes.join(", ")}`), false);
    }
};

// Multer configuration
const uploadConfig = {
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10 // Maximum number of files
    },
    fileFilter: fileFilter
};

// Create multer instance
const upload = multer(uploadConfig);

// Middleware for single file upload
exports.uploadSingle = (fieldName = "file") => {
    return upload.single(fieldName);
};

// Middleware for multiple files upload
exports.uploadMultiple = (fieldName = "files", maxCount = 10) => {
    return upload.array(fieldName, maxCount);
};

// Middleware for multiple fields upload
exports.uploadFields = (fields) => {
    return upload.fields(fields);
};

// Helper function to get file URL/path
exports.getFileUrl = (filename, subDir = "") => {
    const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
    const filePath = subDir ? `${subDir}/${filename}` : filename;
    return `${baseUrl}/uploads/${filePath}`;
};

// Helper function to get file path
exports.getFilePath = (filename, subDir = "") => {
    return path.join(UPLOAD_DIR, subDir, filename);
};

// Helper function to delete file
exports.deleteFile = (filename, subDir = "") => {
    return new Promise((resolve, reject) => {
        const filePath = exports.getFilePath(filename, subDir);
        
        fs.unlink(filePath, (err) => {
            if (err) {
                // File doesn't exist or already deleted
                if (err.code === "ENOENT") {
                    resolve({ success: true, message: "File already deleted or doesn't exist" });
                } else {
                    reject(err);
                }
            } else {
                resolve({ success: true, message: "File deleted successfully" });
            }
        });
    });
};

// Helper function to delete multiple files
exports.deleteFiles = async (filenames, subDir = "") => {
    const results = [];
    for (const filename of filenames) {
        try {
            const result = await exports.deleteFile(filename, subDir);
            results.push({ filename, ...result });
        } catch (error) {
            results.push({ filename, success: false, error: error.message });
        }
    }
    return results;
};

// Helper function to process uploaded files and return URLs
exports.processUploadedFiles = (req) => {
    const files = [];
    const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
    
    if (req.file) {
        // Single file upload
        const subDir = req.file.mimetype.startsWith("image/") ? "images" : "documents";
        files.push({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            url: `${baseUrl}/uploads/${subDir}/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
    } else if (req.files) {
        // Multiple files upload
        const fileArray = Array.isArray(req.files) ? req.files : req.files[Object.keys(req.files)[0]];
        
        fileArray.forEach(file => {
            const subDir = file.mimetype.startsWith("image/") ? "images" : "documents";
            files.push({
                originalName: file.originalname,
                filename: file.filename,
                path: file.path,
                url: `${baseUrl}/uploads/${subDir}/${file.filename}`,
                size: file.size,
                mimetype: file.mimetype
            });
        });
    }
    
    return files;
};

// Error handler middleware for multer errors
exports.handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded"
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected file field"
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "File upload failed"
        });
    }
    
    next();
};

// Note: Static file serving is configured in server.js
// Add this to server.js:
// app.use("/uploads", express.static(path.join(__dirname, UPLOAD_DIR)));

// Cleanup old temporary files (optional utility)
exports.cleanupTempFiles = (olderThanDays = 7) => {
    return new Promise((resolve, reject) => {
        const tempDir = ensureUploadDir("temp");
        const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
        
        fs.readdir(tempDir, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            
            let deletedCount = 0;
            files.forEach(file => {
                const filePath = path.join(tempDir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    
                    if (stats.mtime.getTime() < cutoffDate) {
                        fs.unlink(filePath, (err) => {
                            if (!err) deletedCount++;
                        });
                    }
                });
            });
            
            resolve({ deletedCount });
        });
    });
};

module.exports = exports;

