const { uploadToS3, deleteFromS3 } = require("../services/s3.service");

/**
 * Parse JSON string fields in request body
 * @param {Object} body - req.body object
 * @returns {Object} - The body with parsed JSON fields
 */
const parseJsonFields = (body) => {
    const parsedBody = { ...body };
    const fieldsToParse = [
        "images", "socialMedia", "registration", "paymentMethods", "bankDetails",
        "capacity", "settings", "seo", "subscription", "notificationPreferences",
        "statistics", "daysOff", "holidays", "google360ImageUrl",
        "videos", "tags", "specialties", "languages", "features", "amenities",
        "stats", "notifications", "ratings", "location", "admin", "managers", "staff", "slug"
    ];

    const deepParseAndClean = (input, isArrayField = false) => {
        // 1. Handle non-string inputs
        if (typeof input !== 'string') {
            if (Array.isArray(input)) {
                const cleaned = input.map(item => deepParseAndClean(item, false)).filter(item => {
                    if (item === null || item === undefined || item === "" || item === "[]" || item === "{}" || item === "['[]']" || item === '["[]"]') return false;
                    return true;
                });
                return cleaned.length === 0 && isArrayField ? [] : cleaned;
            }
            // If it's an object with an _id (like admin object), return just the ID
            if (input && typeof input === 'object' && input._id) {
                return input._id;
            }
            return input;
        }

        // 2. Handle string inputs
        const trimmed = input.trim();
        
        // Return null for "empty" values to let Mongoose handle defaults/optionality
        if (trimmed === "" || trimmed === "null" || trimmed === "undefined" || trimmed === "[]" || trimmed === "{}" || trimmed === "['[]']" || trimmed === '["[]"]') {
            return isArrayField ? [] : null;
        }

        try {
            // Try standard JSON parse
            let parsed = JSON.parse(trimmed);
            
            // Recursive check for double-stringified JSON
            if (typeof parsed === 'string') {
                return deepParseAndClean(parsed, isArrayField);
            }
            
            // If it's an array, clean its children
            if (Array.isArray(parsed)) {
                const cleanedArr = parsed.map(item => deepParseAndClean(item, false)).filter(item => !!item && item !== "[]");
                return cleanedArr.length === 0 && isArrayField ? [] : cleanedArr;
            }

            // If parsed object has an _id, return just the ID
            if (parsed && typeof parsed === 'object' && parsed._id) {
                return parsed._id;
            }
            
            return parsed;
        } catch (e) {
            // 3. Fallback for malformed strings like "[ '2024-01-01' ]"
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                try {
                    // Try fixing single quotes
                    const fixed = trimmed.replace(/(?<!\\)'/g, '"');
                    return deepParseAndClean(fixed, isArrayField);
                } catch (err) {
                    // If it contains "[]" as a substring inside malformed string, just kill it
                    if (trimmed.includes("[]")) return isArrayField ? [] : null;
                }
            }
            return trimmed;
        }
    };

    fieldsToParse.forEach(field => {
        const arrayFields = ["gallery", "google360ImageUrl", "videos", "tags", "specialties", "languages", "features", "amenities", "daysOff", "holidays", "managers", "staff"];
        const isArray = arrayFields.includes(field);
        
        const cleanedValue = deepParseAndClean(parsedBody[field], isArray);
        
        // If it's null and not a required field, remove it from the object so Mongoose ignores it
        if (cleanedValue === null) {
            delete parsedBody[field];
        } else {
            parsedBody[field] = cleanedValue;
        }
    });

    return parsedBody;
};

/**
 * Handle image processing for business create/update
 * @param {Object} files - req.files object from multer
 * @param {Object} bodyImages - Existing image URLs from req.body.images or flat req.body
 * @param {Object} existingImages - Current image object from DB (for updates)
 * @returns {Promise<Object>} - The updated images object for DB storage
 */
const handleBusinessImages = async (files, bodyImages = {}, existingImages = {}) => {
    // Normalize bodyImages - already parsed by parseJsonFields if string
    const updatedImages = {
        logo: Object.prototype.hasOwnProperty.call(bodyImages, 'logo') ? bodyImages.logo : existingImages.logo,
        banner: Object.prototype.hasOwnProperty.call(bodyImages, 'banner') ? bodyImages.banner : existingImages.banner,
        thumbnail: Object.prototype.hasOwnProperty.call(bodyImages, 'thumbnail') ? bodyImages.thumbnail : existingImages.thumbnail,
        gallery: Array.isArray(bodyImages.gallery) ? bodyImages.gallery : (existingImages.gallery || []),
    };

    const singleFields = ["logo", "banner", "thumbnail"];
    
    // Check for removals or replacements via URL
    for (const field of singleFields) {
        // ONLY if the field was actually sent in the request
        if (Object.prototype.hasOwnProperty.call(bodyImages, field)) {
            // If an image was explicitly removed (set to empty/null) OR replaced with a different URL
            if (existingImages[field] && bodyImages[field] !== existingImages[field]) {
                // Only delete if the existing one was an S3 URL
                await deleteFromS3(existingImages[field]);
            }
        }
    }

    // Handle gallery cleanup: delete S3 images that were removed from the gallery
    // ONLY if bodyImages.gallery is provided as an array (meaning the gallery was updated)
    if (Array.isArray(existingImages.gallery) && Array.isArray(bodyImages.gallery)) {
        const removedImages = existingImages.gallery.filter(url => !bodyImages.gallery.includes(url));
        for (const url of removedImages) {
            await deleteFromS3(url);
        }
    }

    // If new files are uploaded, handle them
    if (files) {
        for (const field of singleFields) {
            if (files[field] && files[field][0]) {
                // If we haven't already deleted the existing image (via the URL check above)
                // Actually, if we're uploading a file, it's definitely a replacement
                // The URL check above already handles the case where bodyImages[field] !== existingImages[field]
                // But if the frontend sends the OLD URL in body AND a NEW file in files, we still want to delete the OLD URL.
                if (existingImages[field] && bodyImages[field] === existingImages[field]) {
                    await deleteFromS3(existingImages[field]);
                }
                
                // Upload new image
                const folder = field === "thumbnail" ? "business-thumbnail" : `business-${field}`;
                updatedImages[field] = await uploadToS3(files[field][0], folder);
            }
        }

        // Handle gallery (multiple images)
        if (files.gallery && files.gallery.length > 0) {
            const galleryUploads = await Promise.all(
                files.gallery.map((file) => uploadToS3(file, "business-gallery"))
            );
            
            // Append new uploads to the gallery
            updatedImages.gallery = [...updatedImages.gallery, ...galleryUploads];
        }
    }

    return updatedImages;
};

/**
 * Delete all images associated with a business from S3
 * @param {Object} business - The business document
 */
const deleteAllBusinessImages = async (business) => {
    if (!business) return;

    const promises = [];
    const images = business.images || {};

    // Standard images
    if (images.logo) promises.push(deleteFromS3(images.logo));
    if (images.banner) promises.push(deleteFromS3(images.banner));
    if (images.thumbnail) promises.push(deleteFromS3(images.thumbnail));
    
    if (Array.isArray(images.gallery)) {
        images.gallery.forEach(url => promises.push(deleteFromS3(url)));
    }

    // Google 360 Images
    if (Array.isArray(business.google360ImageUrl)) {
        business.google360ImageUrl.forEach(url => promises.push(deleteFromS3(url)));
    }

    // Videos
    if (Array.isArray(business.videos)) {
        business.videos.forEach(url => promises.push(deleteFromS3(url)));
    }

    // SEO OG Image
    if (business.seo && business.seo.ogImage) {
        promises.push(deleteFromS3(business.seo.ogImage));
    }

    await Promise.all(promises);
};

module.exports = {
    parseJsonFields,
    handleBusinessImages,
    deleteAllBusinessImages,
    deleteFromS3,
};
