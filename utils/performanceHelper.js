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

module.exports = {
    chunkArray,
    mapWithConcurrency
};
