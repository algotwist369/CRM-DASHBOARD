/**
 * Decrypts a payload using byte-based XOR with the shared key.
 * Includes sanitization to handle potential control character issues.
 * @param {string} payload - Base64 encoded encrypted string
 * @returns {any} - Decrypted JSON object or null on failure
 */
export const decryptPayload = (payload) => {
    if (!payload) return null;

    const key = "secure-reviews-key"; // Shared key

    const decryptBytes = (str) => {
        const encrypted = atob(str);
        const bytes = new Uint8Array(encrypted.length);
        for (let i = 0; i < encrypted.length; i++) {
            bytes[i] = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        }
        return bytes;
    };

    try {
        const bytes = decryptBytes(payload);
        const decoder = new TextDecoder('utf-8');
        const result = decoder.decode(bytes);
        return JSON.parse(result);
    } catch (error) {
        console.warn("Initial decryption/parse failed, attempting cleanup...", error);
        try {
            // Re-decrypt to get fresh bytes (TextDecoder state might be affected if we reused it? Unlikely but safe)
            const bytes = decryptBytes(payload);
            const decoder = new TextDecoder('utf-8');
            const result = decoder.decode(bytes);

            // Remove invalid control characters (0-31), except tab (9), newline (10), carriage return (13)
            // Also removing basic control characters that might be valid JSON but unwanted in this context if corrupted
            // The regex matching standard JSON-safe control char filtering
            const cleanResult = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

            return JSON.parse(cleanResult);
        } catch (retryError) {
            console.error("Critical: Failed to decrypt payload.", retryError);
            console.debug("Failed string snippet:", result.substring(0, 100));
            throw new Error("Security verification failed");
        }
    }
};
