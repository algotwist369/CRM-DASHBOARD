/**
 * Performance Helper Utility
 * Provides methods for chunking arrays and controlling concurrency of async operations.
 */

/**
 * Split an array into smaller chunks
 * @param {Array} array - The source array
 * @param {number} size - Maximum size of each chunk
 * @returns {Array[]} - Array of chunks
 */
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

/**
 * Process an array of items in parallel with a concurrency limit
 * @param {Array} items - Array of items to process
 * @param {Function} task - Async function to run for each item
 * @param {number} concurrency - Max number of concurrent executions
 * @returns {Promise<Array>} - Results of all tasks
 */
const mapWithConcurrency = async (items, task, concurrency = 10) => {
    const results = [];
    const chunks = chunkArray(items, concurrency);
    
    for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
            chunk.map(item => task(item))
        );
        results.push(...chunkResults);
    }
    
    return results;
};

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Initial delay in ms
 * @param {Function} shouldRetry - Function to determine if retry should happen based on error
 * @returns {Promise<any>} - Result of the function
 */
const withRetry = async (fn, maxRetries = 3, baseDelay = 1000, shouldRetry = () => true) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries || !shouldRetry(error)) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            console.warn(`[Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
};

/**
 * Determine if a MongoDB error is transient and should be retried
 * @param {Error} error - The error to check
 * @returns {boolean} - True if transient
 */
const isTransientMongoError = (error) => {
    // Retry on connection errors, timeout, or specific transient codes
    const transientCodes = [
        11600, // InterruptedAtShutdown
        11601, // InterruptedByStepDown
        11602, // Interrupted
        10107, // NotMaster
        13435, // NotMasterNoSlaveOk
        13436, // NotMasterOrSecondary
        2,     // BadValue (sometimes transient)
        18,    // AuthenticationFailed (sometimes transient during replica set changes)
    ];
    
    return (
        error.name === 'MongoNetworkError' ||
        error.name === 'MongoTimeoutError' ||
        error.name === 'MongoServerSelectionError' ||
        transientCodes.includes(error.code)
    );
};

module.exports = {
    chunkArray,
    mapWithConcurrency,
    withRetry,
    isTransientMongoError
};
