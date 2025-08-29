const axios = require('axios');
const NewsCacheService = require('./cacheService');
const User = require('../models/userModel');

class BackgroundNewsService {
    constructor() {
        this.newsCache = new NewsCacheService();
        this.updateInterval = 30 * 60 * 1000; // 30 minutes
        this.isRunning = false;
        this.updateTimer = null;
    }

    // Start the background service
    start() {
        if (this.isRunning) {
            console.log('Background news service is already running');
            return;
        }

        console.log('Starting background news service...');
        this.isRunning = true;
        
        // Start periodic updates
        this.updateTimer = setInterval(() => {
            this.updateCachedNews();
        }, this.updateInterval);

        // Initial update
        this.updateCachedNews();
    }

    // Stop the background service
    stop() {
        if (!this.isRunning) {
            console.log('Background news service is not running');
            return;
        }

        console.log('Stopping background news service...');
        this.isRunning = false;
        
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    // Update cached news for all user preferences
    async updateCachedNews() {
        try {
            console.log('Starting background news update...');
            
            // Get all unique user preferences
            const users = await User.find({}, 'preferences');
            const allPreferences = users.reduce((acc, user) => {
                if (user.preferences && user.preferences.length > 0) {
                    user.preferences.forEach(pref => {
                        if (!acc.includes(pref)) {
                            acc.push(pref);
                        }
                    });
                }
                return acc;
            }, []);

            console.log(`Found ${allPreferences.length} unique preferences to update`);

            // Update news for each preference
            const updatePromises = allPreferences.map(preference => 
                this.updateNewsForPreference(preference)
            );

            const results = await Promise.allSettled(updatePromises);
            
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            
            console.log(`Background update completed: ${successful} successful, ${failed} failed`);
            
        } catch (error) {
            console.error('Background news update error:', error);
        }
    }

    // Update news for a specific preference
    async updateNewsForPreference(preference) {
        try {
            const newsApiKey = process.env.NEWS_API_KEY;
            if (!newsApiKey) {
                throw new Error('News API key not configured');
            }

            const response = await axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: preference,
                    apiKey: newsApiKey,
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 5
                },
                timeout: 15000
            });

            const newsData = {
                news: [{
                    category: preference,
                    articles: response.data.articles.map(article => ({
                        id: this.generateArticleId(article.url),
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        urlToImage: article.urlToImage,
                        publishedAt: article.publishedAt,
                        source: article.source?.name || 'Unknown'
                    })),
                    totalResults: response.data.totalResults
                }],
                totalCategories: 1,
                failedCategories: 0
            };

            // Update cache
            await this.newsCache.setCachedNews([preference], newsData);
            console.log(`Updated news for preference: ${preference}`);
            
        } catch (error) {
            console.error(`Failed to update news for preference "${preference}":`, error.message);
            throw error;
        }
    }

    // Generate article ID from URL
    generateArticleId(url) {
        return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }

    // Get service status
    getStatus() {
        return {
            isRunning: this.isRunning,
            updateInterval: this.updateInterval,
            lastUpdate: new Date().toISOString()
        };
    }

    // Manually trigger an update
    async triggerUpdate() {
        if (!this.isRunning) {
            throw new Error('Background service is not running');
        }
        
        console.log('Manual update triggered');
        await this.updateCachedNews();
    }
}

module.exports = BackgroundNewsService; 