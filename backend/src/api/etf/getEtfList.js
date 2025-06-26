const { ensureNavData } = require('../../services/navDataService');

/**
 * @swagger
 * /api/etfs/list:
 *   get:
 *     summary: Get categorized ETF NAVs
 *     description: Returns all categorized ETF NAVs for today.
 *     responses:
 *       200:
 *         description: Categorized ETF NAVs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: object
 */

module.exports = async function (req, res) {
  try {
    const navData = await ensureNavData();
    res.json({ categories: navData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ETF data', message: err.message });
  }
}; 