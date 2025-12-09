import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

// Create axios instance with retry logic
const api = axios.create({
    baseURL: API_BASE,
    timeout: 60000, // 60 seconds for AI processing
});

// Retry interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        if (!config || config.__retryCount >= 3) {
            return Promise.reject(error);
        }

        config.__retryCount = config.__retryCount || 0;

        // Retry on network errors or 5xx errors
        if (!error.response || error.response.status >= 500) {
            config.__retryCount += 1;
            await new Promise((resolve) => setTimeout(resolve, 1000 * config.__retryCount));
            return api(config);
        }

        return Promise.reject(error);
    }
);

export const captionApi = {
    // Generate caption for base64 image
    generateCaption: async (imageBase64, options = {}) => {
        const response = await api.post('/caption', {
            image: imageBase64,
            styles: options.styles || ['short', 'detailed', 'alt'],
            tone: options.tone || 'professional',
            max_length: options.maxLength || 150,
        });
        return response.data;
    },

    // Generate caption from URL
    generateCaptionFromUrl: async (url, options = {}) => {
        const response = await api.post('/caption-url', {
            url,
            styles: options.styles || ['short', 'detailed', 'alt'],
            tone: options.tone || 'professional',
            max_length: options.maxLength || 150,
        });
        return response.data;
    },

    // Batch process multiple images
    processBatch: async (images, options = {}) => {
        const response = await api.post('/batch', {
            images,
            styles: options.styles || ['short', 'detailed', 'alt'],
            tone: options.tone || 'professional',
            max_length: options.maxLength || 150,
        });
        return response.data;
    },

    // Get history
    getHistory: async (limit = 20, offset = 0) => {
        const response = await api.get('/history', {
            params: { limit, offset },
        });
        return response.data;
    },

    // Toggle favorite
    toggleFavorite: async (imageId) => {
        const response = await api.post(`/history/${imageId}/favorite`);
        return response.data;
    },

    // Delete history item
    deleteHistoryItem: async (imageId) => {
        const response = await api.delete(`/history/${imageId}`);
        return response.data;
    },

    // Clear all history
    clearHistory: async () => {
        const response = await api.delete('/history');
        return response.data;
    },
};

export default captionApi;
