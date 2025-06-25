const request = require('supertest');
const app = require('../../../src/app');

describe('GET /api/etfs', () => {
  it('should return 200 and an array of ETF objects', async () => {
    const res = await request(app).get('/api/etfs');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const etf = res.body.data[0];
      expect(etf).toHaveProperty('schemeName');
      expect(etf).toHaveProperty('latestNav');
      expect(etf).toHaveProperty('amfiCode');
    }
  }, 20000); // 20s timeout
}); 