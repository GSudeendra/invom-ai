/**
 * @swagger
 * /api/sync/high-liquidity/historical-navs:
 *   post:
 *     summary: Sync historical NAV data for all high-liquidity ETFs
 *     description: Fetches all schemeIds from high-liquidity ETFs, retrieves historical NAV data from mfapi.in, and saves it to MongoDB.
 *     responses:
 *       200:
 *         description: Sync completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 synced:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 */
const { getAllHighLiquiditySchemeIds, fetchAndSaveHistoricalNav } = require('../../services/navDataService');

module.exports = async function (req, res) {
  console.log('[SYNC] Starting historical NAV sync for high-liquidity ETFs...');
  try {
    const schemeIds = await getAllHighLiquiditySchemeIds();
    let synced = 0;
    let errors = [];
    for (const schemeId of schemeIds) {
      console.log(`[SYNC] Fetching historical NAV for schemeId: ${schemeId}`);
      const result = await fetchAndSaveHistoricalNav(schemeId);
      if (result.success) {
        synced++;
        console.log(`[SYNC] Synced historical NAV for schemeId: ${schemeId}`);
      } else {
        errors.push({ schemeId, error: result.error });
        console.error(`[SYNC] Error syncing schemeId ${schemeId}: ${result.error}`);
      }
    }
    console.log(`[SYNC] Sync completed. Total synced: ${synced}, Errors: ${errors.length}`);
    res.json({ success: true, synced, errors });
  } catch (err) {
    console.error('[SYNC] Fatal error during sync:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}; 