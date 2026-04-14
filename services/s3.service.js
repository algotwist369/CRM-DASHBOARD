const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const path = require("path");
require("dotenv").config()

const REGION = process.env.AWS_REGION || "eu-north-1";

// AWS S3 Configuration with connection pooling and retry logic
const s3Client = new S3Client({
    region: REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    maxAttempts: 3, // Built-in retry logic
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "spaadvisor-bucket";

/**
 * Helper to wrap operations with manual retry logic if needed
 */
const withRetry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
};

const uploadToS3 = async (file, folder) => {
    if (!file || !file.buffer) return null;

    return withRetry(async () => {
        try {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            const key = `${folder}/${uniqueSuffix}${ext}`;

            const parallelUploads3 = new Upload({
                client: s3Client,
                params: {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                },
                // Optimize for memory: use smaller part size for 10k+ users concurrency
                partSize: 15 * 1024 * 1024, // 15MB parts
                queueSize: 4, // limit concurrent parts to save memory
            });

            await parallelUploads3.done();
            return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
        } catch (error) {
            console.error("❌ S3 Upload Error:", error.message);
            throw error;
        }
    });
};

const deleteFromS3 = async (fileUrl) => {
    if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.includes(BUCKET_NAME)) {
        return false;
    }

    const key = extractKeyFromUrl(fileUrl);
    if (!key) return false;

    return withRetry(async () => {
        try {
            const command = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(command);
            return true;
        } catch (error) {
            // If file doesn't exist, count as success (nothing to delete)
            if (error.name === 'NoSuchKey' || error.name === 'NotFound') return true;
            console.error("❌ S3 Delete Error:", error.message);
            return false;
        }
    });
};

const extractKeyFromUrl = (url) => {
    try {
        // Example: https://spaadvisor-bucket.s3.ap-south-1.amazonaws.com/business-gallery/12345.jpg
        const urlParts = new URL(url);
        // Pathname starts with / so we remove it
        return urlParts.pathname.substring(1);
    } catch (error) {
        return null;
    }
};

module.exports = {
    uploadToS3,
    deleteFromS3,
    extractKeyFromUrl,
};
