const express = require('express');
const router = express.Router();
const { stockSectorService } = require('../../services/stockSectorService');
const connectDB = require('../../db');

/**
 * @swagger
 * /api/stock/sector/{symbol}:
 *   get:
 *     summary: Get sector information for a stock symbol
 *     description: Retrieves sector information for a given stock symbol using web scraping
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol (e.g., AAPL, MSFT)
 *     responses:
 *       200:
 *         description: Stock sector information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     symbol:
 *                       type: string
 *                       example: "AAPL"
 *                     sector:
 *                       type: string
 *                       example: "Technology"
 *                     industry:
 *                       type: string
 *                       example: "Consumer Electronics"
 *                     marketCap:
 *                       type: number
 *                       example: 2500000
 *                     exchange:
 *                       type: string
 *                       example: "NASDAQ"
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     source:
 *                       type: string
 *                       example: "yahoo"
 *       400:
 *         description: Invalid symbol provided
 *       404:
 *         description: Sector information not found
 *       500:
 *         description: Internal server error
 */
router.get('/sector/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || symbol.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Stock symbol is required'
      });
    }

    await connectDB();
    
    const sectorInfo = await stockSectorService.getStockSector(symbol.trim());
    
    if (!sectorInfo) {
      return res.status(404).json({
        success: false,
        error: `Sector information not found for symbol: ${symbol}`
      });
    }

    res.json({
      success: true,
      data: sectorInfo
    });

  } catch (error) {
    console.error('Error getting stock sector:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/stock/sectors/batch:
 *   post:
 *     summary: Get sector information for multiple stock symbols
 *     description: Retrieves sector information for multiple stock symbols in batch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbols:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["AAPL", "MSFT", "GOOGL"]
 *     responses:
 *       200:
 *         description: Batch sector information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/sectors/batch', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Symbols array is required and must not be empty'
      });
    }

    if (symbols.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 symbols allowed per request'
      });
    }

    await connectDB();
    
    const sectorsData = await stockSectorService.getMultipleStockSectors(symbols);
    
    res.json({
      success: true,
      data: sectorsData,
      found: Object.keys(sectorsData).length,
      requested: symbols.length
    });

  } catch (error) {
    console.error('Error getting batch stock sectors:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/stock/sector/{symbol}/refresh:
 *   post:
 *     summary: Refresh sector information for a stock symbol
 *     description: Forces a refresh of sector information by clearing cache and re-scraping
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Stock symbol to refresh
 *     responses:
 *       200:
 *         description: Sector information refreshed successfully
 *       400:
 *         description: Invalid symbol provided
 *       500:
 *         description: Internal server error
 */
router.post('/sector/:symbol/refresh', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || symbol.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Stock symbol is required'
      });
    }

    await connectDB();
    
    // Clear cache for this symbol
    await stockSectorService.clearCache(symbol.trim());
    
    // Get fresh data
    const sectorInfo = await stockSectorService.getStockSector(symbol.trim());
    
    if (!sectorInfo) {
      return res.status(404).json({
        success: false,
        error: `Sector information not found for symbol: ${symbol}`
      });
    }

    res.json({
      success: true,
      message: 'Sector information refreshed successfully',
      data: sectorInfo
    });

  } catch (error) {
    console.error('Error refreshing stock sector:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/stock/sectors/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Returns statistics about the sector cache
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     memoryCacheSize:
 *                       type: number
 *                       example: 150
 *                     databaseCacheSize:
 *                       type: number
 *                       example: 500
 *                     cacheTimeout:
 *                       type: number
 *                       example: 86400000
 *       500:
 *         description: Internal server error
 */
router.get('/sectors/cache/stats', async (req, res) => {
  try {
    await connectDB();
    
    const stats = await stockSectorService.getCacheStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/stock/sectors/cache/clear:
 *   post:
 *     summary: Clear all sector cache
 *     description: Clears both memory and database cache for all stock sectors
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *       500:
 *         description: Internal server error
 */
router.post('/sectors/cache/clear', async (req, res) => {
  try {
    await connectDB();
    
    // Clear memory cache
    stockSectorService.cache.clear();
    
    // Clear database cache
    const { StockSector } = require('../../services/stockSectorService');
    await StockSector.deleteMany({});
    
    res.json({
      success: true,
      message: 'All sector cache cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router; 