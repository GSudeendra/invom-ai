const puppeteer = require('puppeteer');
const os = require('os');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-detect local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const localIPs = [];
  
  Object.keys(interfaces).forEach(ifaceName => {
    interfaces[ifaceName].forEach(iface => {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        localIPs.push(iface.address);
      }
    });
  });
  
  return localIPs;
}

// Check if IP is in CIDR range
function isInCIDR(ip, cidr) {
  const [range, bits = 32] = cidr.split('/');
  const mask = ~((1 << (32 - bits)) - 1);
  const ipLong = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  const rangeLong = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  return (ipLong & mask) === (rangeLong & mask);
}

// Get excluded IPs (auto-detected + manual)
function getExcludedIPs() {
  const localIPs = getLocalIPs();
  const manualIPs = [
    // Add your specific IPs here if needed
    // '192.168.1.100',
    // '10.0.0.50'
  ];
  
  const cidrRanges = [
    '127.0.0.0/8',    // localhost
    '10.0.0.0/8',     // private network
    '172.16.0.0/12',  // private network
    '192.168.0.0/16', // private network
    '::1/128'         // localhost IPv6
  ];
  
  return {
    exactIPs: [...localIPs, ...manualIPs, '::1', '127.0.0.1'],
    cidrRanges: cidrRanges
  };
}

// Simple in-memory rate limiter
const requestHistory = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(clientIP) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!requestHistory.has(clientIP)) {
    requestHistory.set(clientIP, []);
  }
  
  const requests = requestHistory.get(clientIP);
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  requestHistory.set(clientIP, recentRequests);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  recentRequests.push(now);
  return false;
}

function isIPExcluded(clientIP) {
  const excluded = getExcludedIPs();
  
  // Check exact IPs
  if (excluded.exactIPs.includes(clientIP)) {
    return true;
  }
  
  // Check CIDR ranges
  for (const cidr of excluded.cidrRanges) {
    if (isInCIDR(clientIP, cidr)) {
      return true;
    }
  }
  
  return false;
}

async function fetchWithRetry(page, apiUrl, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
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
        
        if (resp.status === 429) {
          return { error: 'RATE_LIMITED', status: 429 };
        }
        
        const text = await resp.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          return { error: 'Not JSON', text };
        }
      }, apiUrl);

      if (data && data.error === 'RATE_LIMITED') {
        console.log(`Attempt ${attempt}: Rate limited by NSE API`);
        if (attempt < maxRetries) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`Waiting ${backoffDelay}ms before retry...`);
          await sleep(backoffDelay);
          continue;
        } else {
          return { error: 'RATE_LIMITED_FINAL' };
        }
      }
      
      return data;
    } catch (err) {
      console.log(`Attempt ${attempt} failed:`, err.message);
      if (attempt < maxRetries) {
        const backoffDelay = Math.pow(2, attempt) * 1000;
        await sleep(backoffDelay);
        continue;
      }
      throw err;
    }
  }
}

// Log excluded IPs on module load
const excludedIPs = getExcludedIPs();
console.log('🔒 Rate limiting excluded IPs:');
console.log('   Exact IPs:', excludedIPs.exactIPs);
console.log('   CIDR Ranges:', excludedIPs.cidrRanges);

module.exports = async function (req, res) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Exclude certain IPs from rate limiting
  if (!isIPExcluded(clientIP)) {
    // Check rate limiting
    if (isRateLimited(clientIP)) {
      console.log(`Rate limited for IP: ${clientIP}`);
      return res.status(429).json({
        error: 'Too many requests from this IP',
        message: 'Please wait a minute before making another request',
        retryAfter: 60,
        data: [],
        note: 'No data available due to rate limiting'
      });
    }
  } else {
    console.log(`✅ IP ${clientIP} excluded from rate limiting`);
  }

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
    await sleep(2000);
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.keyboard.press('PageDown');
    await sleep(1000);

    // Step 2: Fetch the ETF API endpoint with retry logic
    const apiUrl = 'https://www.nseindia.com/api/etf';
    const data = await fetchWithRetry(page, apiUrl);

    // Handle rate limiting
    if (data && data.error === 'RATE_LIMITED_FINAL') {
      console.log('NSE API rate limited after all retries');
      return res.status(429).json({
        error: 'NSE API rate limited',
        message: 'The NSE API is currently rate limited. Please try again later.',
        data: [],
        retryAfter: 300 // 5 minutes
      });
    }

    // Detect if we got HTML (CAPTCHA or error page)
    if (data && data.error === 'Not JSON') {
      console.log('NSE API raw response:', data.text);
      if (typeof data.text === 'string' && (data.text.includes('captcha') || data.text.includes('<!DOCTYPE'))) {
        return res.status(403).json({
          error: 'Blocked by NSE anti-bot protection',
          message: 'The NSE website is blocking automated requests. Please try again later.',
          data: []
        });
      }
      return res.status(502).json({
        error: 'Invalid response from NSE API',
        message: 'The NSE API returned an invalid response.',
        data: []
      });
    }

    if (!data || !data.data) {
      return res.status(502).json({
        error: 'Invalid response from NSE API',
        message: 'The NSE API returned an invalid response format.',
        data: []
      });
    }

    // Log the structure of the first ETF to understand available fields
    if (data.data && data.data.length > 0) {
      console.log('NSE ETF data structure (first item):', JSON.stringify(data.data[0], null, 2));
    }

    res.json(data);
  } catch (err) {
    console.error('Puppeteer error:', err.message);
    res.status(500).json({
      error: 'Failed to fetch NSE ETF data',
      message: 'An error occurred while fetching data from NSE.',
      data: []
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}; 