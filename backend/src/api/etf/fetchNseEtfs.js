const puppeteer = require('puppeteer');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = async function (req, res) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    // Step 1: Go to NSE homepage to establish session
    await page.goto('https://www.nseindia.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for cookies to be set and simulate user activity
    await sleep(2000);
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.keyboard.press('PageDown');
    await sleep(1000);

    // Step 2: Fetch the ETF API endpoint as JSON using fetch in the browser context
    const apiUrl = 'https://www.nseindia.com/api/etf';
    const data = await page.evaluate(async (apiUrl) => {
      function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
      await sleep(1000);
      const resp = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
        },
        credentials: 'same-origin'
      });
      const text = await resp.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { error: 'Not JSON', text };
      }
    }, apiUrl);

    // Detect if we got HTML (CAPTCHA or error page)
    if (data && data.error === 'Not JSON') {
      // Log the raw response for debugging
      console.log('NSE API raw response:', data.text);
      if (typeof data.text === 'string' && (data.text.includes('captcha') || data.text.includes('<!DOCTYPE'))) {
        return res.status(429).json({ error: 'Blocked by NSE anti-bot (CAPTCHA or HTML)', details: data.text.slice(0, 200) });
      }
      return res.status(502).json({ error: 'Invalid response from NSE API', details: data.text.slice(0, 200) });
    }
    if (!data || !data.data) {
      return res.status(502).json({ error: 'Invalid response from NSE API', details: data });
    }

    // Log the structure of the first ETF to understand available fields
    if (data.data && data.data.length > 0) {
      console.log('NSE ETF data structure (first item):', JSON.stringify(data.data[0], null, 2));
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch NSE ETF data (Puppeteer)', details: err.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 