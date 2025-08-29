const mongoose = require('mongoose');

const userNewsInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    articleId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'Unknown'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    favoritedAt: {
        type: Date,
        default: null
    },
    category: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Compound index to ensure unique user-article combinations
userNewsInteractionSchema.index({ userId: 1, articleId: 1 }, { unique: true });

// Index for efficient queries
userNewsInteractionSchema.index({ userId: 1, isRead: 1 });
userNewsInteractionSchema.index({ userId: 1, isFavorite: 1 });
userNewsInteractionSchema.index({ userId: 1, category: 1 });

// Method to mark article as read
userNewsInteractionSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Method to mark article as favorite
userNewsInteractionSchema.methods.markAsFavorite = function() {
    this.isFavorite = true;
    this.favoritedAt = new Date();
    return this.save();
};

// Method to remove from favorites
userNewsInteractionSchema.methods.removeFromFavorites = function() {
    this.isFavorite = false;
    this.favoritedAt = null;
    return this.save();
};

// Static method to find or create interaction
userNewsInteractionSchema.statics.findOrCreateInteraction = async function(userId, articleData) {
    const { articleId, title, url, source, category } = articleData;
    
    let interaction = await this.findOne({ userId, articleId });
    
    if (!interaction) {
        interaction = new this({
            userId,
            articleId,
            title,
            url,
            source,
            category
        });
    }
    
    return interaction;
};

module.exports = mongoose.model('UserNewsInteraction', userNewsInteractionSchema); 