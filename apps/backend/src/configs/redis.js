const { createClient } = require('redis');

class CacheManager {
    constructor() {
        this.client = null;
        this.fallbackCache = new Map();
        this.useFallback = false;
        this.init();
    }

    async init() {
        const redisUrl = process.env.REDIS_SERVER_URL || process.env.REDIS_LOCAL_URL || process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        
        try {
            this.client = createClient({ url: redisUrl });
            this.errorLogged = false;
            
            this.client.on('error', (err) => {
                if (!this.errorLogged) {
                    console.error('Redis Client Error. Falling back to in-memory cache.', err.message || err);
                    this.errorLogged = true;
                }
                this.useFallback = true;
            });

            this.client.on('connect', () => {
                console.log('✅ Connected to Redis successfully');
                this.useFallback = false;
                this.errorLogged = false;
            });

            await this.client.connect();
        } catch (error) {
            if (!this.errorLogged) {
                console.error('Failed to connect to Redis. Using in-memory fallback cache.', error.message || error);
                this.errorLogged = true;
            }
            this.useFallback = true;
        }
    }

    async get(key) {
        if (this.useFallback) {
            const item = this.fallbackCache.get(key);
            if (!item) return null;
            if (item.expiry && Date.now() > item.expiry) {
                this.fallbackCache.delete(key);
                return null;
            }
            return item.value;
        }

        try {
            if (!this.client?.isReady) return null;
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Redis GET error for key ${key}:`, error);
            return null;
        }
    }

    async set(key, value, expirationInSeconds = 300) {
        if (this.useFallback) {
            this.fallbackCache.set(key, {
                value,
                expiry: Date.now() + (expirationInSeconds * 1000)
            });
            return true;
        }

        try {
            if (!this.client?.isReady) return false;
            await this.client.setEx(key, expirationInSeconds, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Redis SET error for key ${key}:`, error);
            return false;
        }
    }

    async del(key) {
        if (this.useFallback) {
            this.fallbackCache.delete(key);
            return true;
        }

        try {
            if (!this.client?.isReady) return false;
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error(`Redis DEL error for key ${key}:`, error);
            return false;
        }
    }
}

const cache = new CacheManager();

module.exports = cache;
