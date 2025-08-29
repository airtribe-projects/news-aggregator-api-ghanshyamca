const axios = require('axios');
const User = require('../models/userModel');

const getNewsForUser = async (req, res) => {
    try {
        // Get user preferences
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userPreferences = user.preferences;
        if (!userPreferences || userPreferences.length === 0) {
            return res.status(400).json({ 
                error: 'No preferences set. Please set your news preferences first.' 
            });
        }

        // Get news API key from environment
        const newsApiKey = process.env.NEWS_API_KEY;
        if (!newsApiKey) {
            return res.status(500).json({ 
                error: 'News API key not configured' 
            });
        }

        // Fetch news for each preference
        const newsPromises = userPreferences.map(async (preference) => {
            try {
                const response = await axios.get('https://newsapi.org/v2/everything', {
                    params: {
                        q: preference,
                        apiKey: newsApiKey,
                        language: 'en',
                        sortBy: 'publishedAt',
                        pageSize: 5 // Limit to 5 articles per preference
                    },
                    timeout: 10000 // 10 second timeout
                });

                return {
                    preference,
                    articles: response.data.articles || [],
                    totalResults: response.data.totalResults || 0
                };
            } catch (error) {
                console.error(`Error fetching news for preference "${preference}":`, error.message);
                return {
                    preference,
                    articles: [],
                    totalResults: 0,
                    error: `Failed to fetch news for ${preference}`
                };
            }
        });

        // Wait for all news requests to complete
        const newsResults = await Promise.allSettled(newsPromises);
        
        // Process results
        const successfulResults = newsResults
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
        
        const failedResults = newsResults
            .filter(result => result.status === 'rejected')
            .map(result => result.reason);

        // Log any failures
        if (failedResults.length > 0) {
            console.error('Some news requests failed:', failedResults);
        }

        // Format response
        const formattedNews = successfulResults.map(result => ({
            category: result.preference,
            articles: result.articles.map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                urlToImage: article.urlToImage,
                publishedAt: article.publishedAt,
                source: article.source?.name || 'Unknown'
            })),
            totalResults: result.totalResults
        }));

        res.json({
            message: 'News fetched successfully',
            userPreferences,
            news: formattedNews,
            totalCategories: successfulResults.length,
            failedCategories: failedResults.length
        });

    } catch (error) {
        console.error('News fetching error:', error);
        
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ 
                error: 'News API request timeout. Please try again later.' 
            });
        }
        
        if (error.response?.status === 401) {
            return res.status(500).json({ 
                error: 'News API authentication failed. Please check API key configuration.' 
            });
        }
        
        if (error.response?.status === 429) {
            return res.status(429).json({ 
                error: 'News API rate limit exceeded. Please try again later.' 
            });
        }

        res.status(500).json({ 
            error: 'Failed to fetch news. Please try again later.' 
        });
    }
};

module.exports = {
    getNewsForUser
}; 