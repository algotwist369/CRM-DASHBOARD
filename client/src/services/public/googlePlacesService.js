import { apiClient } from '../api';
import axios from 'axios';

class GooglePlacesService {
    constructor() {
        this.autocompleteCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.pendingRequest = null;
    }

    /**
     * Get business autocomplete from database
     * @param {string} input - User input text
     * @param {number} limit - Max suggestions
     * @param {number} lat - User latitude (optional)
     * @param {number} lng - User longitude (optional)
     * @returns {Promise<Array>} Array of business suggestions
     */
    async getBusinessAutocomplete(input, limit = 20, lat = null, lng = null) {
        try {
            if (!input || input.trim().length < 2) {
                return { success: true, suggestions: [], source: 'empty' };
            }

            // Check cache
            const cacheKey = `business:${input}:${limit}:${lat}:${lng}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return { success: true, suggestions: cached, source: 'cache' };
            }

            const params = {
                input: input.trim(),
                limit,
                ...(lat && lng ? { lat, lng } : {})
            };

            const response = await apiClient.get('/business/public/search/business-autocomplete', {
                params
            });

            if (response.data.success && response.data.suggestions) {
                // Cache results
                this.setCache(cacheKey, response.data.suggestions);

                return {
                    success: true,
                    suggestions: response.data.suggestions,
                    source: response.data.source || 'database'
                };
            }

            return { success: true, suggestions: [], source: 'empty_result' };
        } catch (error) {
            console.error('[Business Autocomplete] Error:', error);
            return { success: false, error: error.message, suggestions: [] };
        }
    }

    /**
     * Get autocomplete suggestions from Google Places API
     * @param {string} input - User input text
     * @param {object} options - Additional options (types, location bias)
     * @returns {Promise<Array>} Array of suggestions
     */
    async getAutocomplete(input, options = {}) {
        try {
            if (!input || input.trim().length < 2) {
                return { success: true, suggestions: [], source: 'empty' };
            }

            // Check cache
            const cacheKey = `${input}:${JSON.stringify(options)}`;
            const cached = this.getCache(cacheKey);
            if (cached) {
                return { success: true, suggestions: cached, source: 'cache' };
            }

            // Cancel pending request if exists
            if (this.pendingRequest) {
                this.pendingRequest.cancel('New request initiated');
            }

            // Create new cancellable request
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
            this.pendingRequest = source;

            const params = {
                input: input.trim(),
                ...options
            };

            const response = await apiClient.get('/business/public/search/autocomplete', {
                params,
                cancelToken: source.token
            });

            this.pendingRequest = null;

            if (response.data.success && response.data.suggestions) {
                // Cache results
                this.setCache(cacheKey, response.data.suggestions);

                return {
                    success: true,
                    suggestions: response.data.suggestions,
                    source: response.data.source || 'api'
                };
            }

            return { success: true, suggestions: [], source: 'empty_result' };
        } catch (error) {
            if (axios.isCancel(error)) {
                console.log('Request cancelled:', error.message);
                return { success: false, cancelled: true };
            }

            console.error('[Places Autocomplete] Error:', error);
            return { success: false, error: error.message, suggestions: [] };
        }
    }

    /**
     * Get place details by place_id
     * @param {string} placeId - Google Place ID
     * @returns {Promise<Object>} Place details
     */
    async getPlaceDetails(placeId) {
        try {
            if (!placeId) {
                return { success: false, error: 'place_id is required' };
            }

            const response = await apiClient.get('/business/public/search/place-details', {
                params: { place_id: placeId }
            });

            if (response.data.success) {
                return {
                    success: true,
                    place: response.data.place
                };
            }

            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('[Place Details] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Search with Google Places API integration
     * @param {object} searchParams - Search parameters
     * @returns {Promise<Object>} Search results
     */
    async searchWithPlaces(searchParams) {
        try {
            const response = await apiClient.get('/business/public/search/places', {
                params: searchParams
            });

            if (response.data.success) {
                // Decrypt payload if needed (matching existing pattern)
                if (response.data.payload) {
                    const { decryptPayload } = await import('../../utils/encryption');
                    const decryptedData = decryptPayload(response.data.payload);

                    if (decryptedData) {
                        return { success: true, data: decryptedData };
                    }
                }

                return { success: true, data: response.data };
            }

            return { success: false, error: response.data.error };
        } catch (error) {
            console.error('[Search with Places] Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get cached result ifavailable and not expired
     */
    getCache(key) {
        const cached = this.autocompleteCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.autocompleteCache.delete(key);
        return null;
    }

    /**
     * Set cache with timestamp
     */
    setCache(key, data) {
        this.autocompleteCache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Limit cache size to 50 entries
        if (this.autocompleteCache.size > 50) {
            const firstKey = this.autocompleteCache.keys().next().value;
            this.autocompleteCache.delete(firstKey);
        }
    }

    /**
     * Clear all caches
     */
    clearCache() {
        this.autocompleteCache.clear();
    }

    /**
     * Cancel any pending autocomplete request
     */
    cancelPending() {
        if (this.pendingRequest) {
            this.pendingRequest.cancel('Request cancelled by user');
            this.pendingRequest = null;
        }
    }
}

export default new GooglePlacesService();
