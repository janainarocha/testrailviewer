// Browser API Module - Handles all API interactions for the browser feature

// Constants
const API_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    CACHE_TTL: 300000 // 5 minutes
};

export class BrowserAPI {
    constructor() {
        this.cache = new Map();
        this.abortControllers = new Map();
    }

    async fetchWithRetry(url, options = {}, retries = API_CONFIG.MAX_RETRIES) {
        // Cancel previous request if exists
        const cacheKey = url;
        if (this.abortControllers.has(cacheKey)) {
            this.abortControllers.get(cacheKey).abort();
        }

        const controller = new AbortController();
        this.abortControllers.set(cacheKey, controller);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            this.abortControllers.delete(cacheKey);
            
            return data;
        } catch (error) {
            this.abortControllers.delete(cacheKey);
            
            if (error.name === 'AbortError') {
                throw new Error('Request cancelled');
            }

            if (retries > 0 && !error.message.includes('404')) {
                console.warn(`Retrying request to ${url}. Attempts left: ${retries - 1}`);
                await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
                return this.fetchWithRetry(url, options, retries - 1);
            }
            
            throw error;
        }
    }

    async getProjects() {
        const cacheKey = '/api/browser/projects';
        const cached = this.cache.get(cacheKey);
        
        // Use cache if fresh
        if (cached && Date.now() - cached.timestamp < API_CONFIG.CACHE_TTL) {
            return cached.data;
        }

        return this.fetchWithRetry(cacheKey);
    }

    async getSuites(projectId) {
        if (!projectId) throw new Error('Project ID is required');
        return this.fetchWithRetry(`/api/browser/suites/${projectId}`);
    }

    async getSections(suiteId) {
        if (!suiteId) throw new Error('Suite ID is required');
        return this.fetchWithRetry(`/api/browser/sections/${suiteId}`);
    }

    async getCases(suiteId) {
        if (!suiteId) throw new Error('Suite ID is required');
        return this.fetchWithRetry(`/api/browser/cases/${suiteId}`);
    }

    clearCache() {
        this.cache.clear();
    }

    cancelAllRequests() {
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
    }
}
