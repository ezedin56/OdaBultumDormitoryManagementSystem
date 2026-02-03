const asyncHandler = require('express-async-handler');

// In-memory cache storage (can be replaced with Redis in production)
let cache = {
    students: null,
    rooms: null,
    statistics: null,
    lastCleared: null
};

// @desc    Clear server-side cache
// @route   POST /api/cache/clear
// @access  Private/Admin
const clearCache = asyncHandler(async (req, res) => {
    try {
        console.log('🧹 Clearing server cache...');

        // Clear all cached data
        cache = {
            students: null,
            rooms: null,
            statistics: null,
            lastCleared: new Date().toISOString()
        };

        console.log('✅ Cache cleared successfully');

        res.json({
            success: true,
            message: 'Cache cleared successfully',
            clearedAt: cache.lastCleared
        });
    } catch (error) {
        console.error('❌ Cache clear error:', error);
        res.status(500);
        throw new Error('Failed to clear cache: ' + error.message);
    }
});

// @desc    Get cache statistics
// @route   GET /api/cache/stats
// @access  Private/Admin
const getCacheStats = asyncHandler(async (req, res) => {
    try {
        const stats = {
            lastCleared: cache.lastCleared || 'Never',
            cachedItems: {
                students: cache.students ? 'Cached' : 'Empty',
                rooms: cache.rooms ? 'Cached' : 'Empty',
                statistics: cache.statistics ? 'Cached' : 'Empty'
            }
        };

        res.json(stats);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to get cache statistics');
    }
});

// Helper function to get cache
const getCache = (key) => {
    return cache[key];
};

// Helper function to set cache
const setCache = (key, value) => {
    cache[key] = value;
};

module.exports = {
    clearCache,
    getCacheStats,
    getCache,
    setCache
};
