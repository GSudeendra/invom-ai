const HighLiquidityEtf = require('../../models/HighLiquidityEtf');

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