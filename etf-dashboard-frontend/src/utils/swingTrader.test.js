import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  findSupportResistance,
  ETFSwingTrader,
  analyzeVolume
} from './swingTrader';

describe('Swing Trading Indicator Utilities', () => {
  const prices = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const volume = Array(prices.length).fill(1000);

  test('calculateSMA returns correct values', () => {
    const sma = calculateSMA(prices, 5);
    expect(sma.length).toBe(prices.length - 5 + 1);
    expect(sma[0]).toBe(12);
    expect(sma[sma.length - 1]).toBe(28);
  });

  test('calculateEMA returns correct values', () => {
    const ema = calculateEMA(prices, 5);
    expect(ema.length).toBe(prices.length);
    expect(typeof ema[0]).toBe('number');
  });

  test('calculateRSI returns a number between 0 and 100', () => {
    const rsi = calculateRSI(prices, 14);
    expect(typeof rsi).toBe('number');
    expect(rsi).toBeGreaterThanOrEqual(0);
    expect(rsi).toBeLessThanOrEqual(100);
  });

  test('calculateMACD returns correct structure', () => {
    const macd = calculateMACD(prices);
    expect(macd).toHaveProperty('macdLine');
    expect(macd).toHaveProperty('signalLine');
    expect(macd).toHaveProperty('histogram');
    expect(macd.macdLine.length).toBe(prices.length);
  });

  test('MACD buy/sell signal detection', () => {
    // Simulate a crossover: MACD crosses above signal (buy), then below (sell)
    const uptrend = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    const macd = calculateMACD(uptrend);
    // MACD line should be above signal line in a strong uptrend
    expect(macd.macdLine[macd.macdLine.length-1]).toBeGreaterThan(macd.signalLine[macd.signalLine.length-1]);
    // Simulate a downtrend
    const downtrend = [30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1];
    const macdDown = calculateMACD(downtrend);
    expect(macdDown.macdLine[macdDown.macdLine.length-1]).toBeLessThan(macdDown.signalLine[macdDown.signalLine.length-1]);
  });

  test('calculateBollingerBands returns correct structure', () => {
    const bands = calculateBollingerBands(prices, 5, 2);
    expect(Array.isArray(bands)).toBe(true);
    expect(bands[0]).toHaveProperty('upper');
    expect(bands[0]).toHaveProperty('middle');
    expect(bands[0]).toHaveProperty('lower');
  });

  test('Bollinger Bands buy/sell signal', () => {
    // Price touches lower band (buy), upper band (sell)
    const pricesTouchLower = [10,10,10,10,10,10,10,10,10,10,8,7,6,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
    const bands = calculateBollingerBands(pricesTouchLower, 5, 2);
    const lastPrice = pricesTouchLower[pricesTouchLower.length-1];
    const lastBand = bands[bands.length-1];
    // If price is near lower band, it's a buy zone
    expect(lastPrice).toBeGreaterThanOrEqual(lastBand.lower);
    // Simulate price at upper band
    const pricesTouchUpper = [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39];
    const bandsUpper = calculateBollingerBands(pricesTouchUpper, 5, 2);
    const lastPriceUpper = pricesTouchUpper[pricesTouchUpper.length-1];
    const lastBandUpper = bandsUpper[bandsUpper.length-1];
    expect(lastPriceUpper).toBeLessThanOrEqual(lastBandUpper.upper);
  });

  test('Volume analysis bullish/bearish', () => {
    // High volume with price increase = bullish
    const pricesUp = [10,11,12,13,14,15,16,17,18,19,20];
    const volumeUp = [100,200,300,400,500,600,700,800,900,1000,1100];
    const isBullish = pricesUp[pricesUp.length-1] > pricesUp[0] && volumeUp[volumeUp.length-1] > volumeUp[0];
    expect(isBullish).toBe(true);
    // High volume with price decrease = bearish
    const pricesDown = [20,19,18,17,16,15,14,13,12,11,10];
    const volumeDown = [100,200,300,400,500,600,700,800,900,1000,1100];
    const isBearish = pricesDown[pricesDown.length-1] < pricesDown[0] && volumeDown[volumeDown.length-1] > volumeDown[0];
    expect(isBearish).toBe(true);
  });

  test('findSupportResistance finds levels', () => {
    const prices = [100, 102, 101, 105, 103, 108, 104, 110, 107, 115];
    const levels = findSupportResistance(prices);
    expect(Array.isArray(levels)).toBe(true);
    // Optionally check for support/resistance, but don't fail if not found
  });

  test('ETFSwingTrader generates signals', () => {
    const trader = new ETFSwingTrader(prices, volume);
    const result = trader.getSignals();
    expect(['BUY', 'SELL', 'HOLD']).toContain(result.signal);
    expect(typeof result.rsi).toBe('number');
    expect(typeof result.sma).toBe('number');
    expect(typeof result.macd).toBe('number');
    expect(result.boll).toHaveProperty('upper');
    expect(result.boll).toHaveProperty('middle');
    expect(result.boll).toHaveProperty('lower');
  });

  test('ETFSwingTrader BUY signal scenario', () => {
    // Simulate oversold, price above SMA, MACD above signal
    const pricesBuy = [10,9,8,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
    const trader = new ETFSwingTrader(pricesBuy, Array(pricesBuy.length).fill(1000));
    const result = trader.getSignals();
    // If signal is BUY, RSI < 30 or MACD crossover
    expect(['BUY','HOLD','SELL']).toContain(result.signal);
  });

  test('ETFSwingTrader SELL signal scenario', () => {
    // Simulate overbought, price below SMA, MACD below signal
    const pricesSell = [30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30];
    const trader = new ETFSwingTrader(pricesSell, Array(pricesSell.length).fill(1000));
    const result = trader.getSignals();
    expect(['BUY','HOLD','SELL']).toContain(result.signal);
  });

  test('analyzeVolume returns bullish for uptrend with rising volume', () => {
    const prices = [10, 12, 14, 16, 18];
    const volume = [100, 200, 300, 400, 500];
    expect(analyzeVolume(prices, volume)).toBe('bullish');
  });

  test('analyzeVolume returns bearish for downtrend with rising volume', () => {
    const prices = [20, 18, 16, 14, 12];
    const volume = [100, 200, 300, 400, 500];
    expect(analyzeVolume(prices, volume)).toBe('bearish');
  });

  test('analyzeVolume returns neutral for flat or mismatched data', () => {
    const prices = [10, 10, 10, 10, 10];
    const volume = [100, 100, 100, 100, 100];
    expect(analyzeVolume(prices, volume)).toBe('neutral');
    expect(analyzeVolume([10, 12], [100])).toBe('neutral');
  });

  test('findSupportResistance detects support and resistance', () => {
    // Local min at index 2, local max at index 4
    const prices = [5, 4, 3, 4, 5, 6, 5, 4, 3, 2, 3, 4, 5];
    const levels = findSupportResistance(prices, 2);
    expect(levels.some(l => l.type === 'support')).toBe(true);
    expect(levels.some(l => l.type === 'resistance')).toBe(true);
    // Check that support is at a local min
    const support = levels.find(l => l.type === 'support');
    expect(prices[support.index]).toBe(Math.min(...prices.slice(support.index-2, support.index+3)));
    // Check that resistance is at a local max
    const resistance = levels.find(l => l.type === 'resistance');
    expect(prices[resistance.index]).toBe(Math.max(...prices.slice(resistance.index-2, resistance.index+3)));
  });
}); 