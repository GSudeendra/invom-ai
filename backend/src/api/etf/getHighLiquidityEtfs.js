const HighLiquidityEtf = require('../../models/HighLiquidityEtf');

/**
 * @swagger
 * /api/etfs/high-liquidity:
 *   get:
 *     summary: Get high liquidity ETFs
 *     description: Returns a paginated list of high liquidity ETFs with optional filtering and search.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by ETF category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for ETF name, symbol, or scheme name
 *     responses:
 *       200:
 *         description: List of high liquidity ETFs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                 filters:
 *                   type: object
 */
async function getHighLiquidityEtfs(req, res) {
  try {
    const { 
      category, 
      limit = 50, 
      page = 1, 
      sortBy = 'rank', 
      sortOrder = 'asc',
      search 
    } = req.query;

    // Build query
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { etfName: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
        { schemeName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Execute query
    const [etfs, total] = await Promise.all([
      HighLiquidityEtf.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      HighLiquidityEtf.countDocuments(query)
    ]);

    // Get unique categories for filtering
    const categories = await HighLiquidityEtf.distinct('category');

    res.json({
      success: true,
      data: etfs,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      filters: {
        categories: categories.sort()
      }
    });

  } catch (error) {
    console.error('Error fetching high liquidity ETFs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch high liquidity ETFs',
      message: error.message
    });
  }
}

module.exports = getHighLiquidityEtfs; 