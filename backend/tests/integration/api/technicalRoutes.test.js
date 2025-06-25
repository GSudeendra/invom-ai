const request = require('supertest');
const app = require('../../../src/app');

describe('GET /api/swing-trading/technical/:symbol', () => {
  it('should return 200 and technical indicators for a real ETF symbol', async () => {
    // Use a real symbol present in the data, e.g., GROWW3
    const symbol = 'GROWW3';
    const res = await request(app).get(`/api/swing-trading/technical/${symbol}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('symbol', symbol);
    expect(res.body.data).toHaveProperty('rsi');
    expect(res.body.data).toHaveProperty('sma5');
    expect(res.body.data).toHaveProperty('sma20');
    expect(res.body.data).toHaveProperty('volatility');
    expect(res.body.data).toHaveProperty('dailyChangePercent');
    expect(res.body.data).toHaveProperty('weeklyChangePercent');
    expect(res.body.data).toHaveProperty('smaCrossover');
    expect(res.body.data).toHaveProperty('rsiColor');
    expect(res.body.data).toHaveProperty('volatilityTag');
    expect(res.body.data).toHaveProperty('historicalPrices');
  }, 20000);
}); 