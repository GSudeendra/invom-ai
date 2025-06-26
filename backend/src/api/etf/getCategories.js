const { getAllCategories } = require('../../services/navDataService');

/**
 * @swagger
 * /api/etfs/categories:
 *   get:
 *     summary: Get all ETF categories
 *     description: Returns a list of all available ETF categories.
 *     responses:
 *       200:
 *         description: List of ETF categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   key:
 *                     type: string
 *                   label:
 *                     type: string
 */

module.exports = async function (req, res) {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get categories', message: err.message });
  }
}; 