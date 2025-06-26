const { getEtfsByCategory } = require('../../services/navDataService');

/**
 * @swagger
 * /api/etfs/category/{categoryKey}:
 *   get:
 *     summary: Get ETFs by category
 *     description: Returns all ETFs for a specific category.
 *     parameters:
 *       - in: path
 *         name: categoryKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The key of the ETF category
 *     responses:
 *       200:
 *         description: ETFs for the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 label:
 *                   type: string
 *                 description:
 *                   type: string
 *                 keywords:
 *                   type: array
 *                   items:
 *                     type: string
 *                 funds:
 *                   type: array
 *                   items:
 *                     type: object
 */

module.exports = async function (req, res) {
  const categoryKey = req.params.categoryKey;
  if (!categoryKey) {
    return res.status(400).json({ error: 'Missing categoryKey parameter' });
  }
  try {
    const category = await getEtfsByCategory(categoryKey);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get ETFs for category', message: err.message });
  }
}; 