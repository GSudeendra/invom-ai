const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const os = require('os');

puppeteer.use(StealthPlugin());

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const localIPs = [];
  Object.keys(interfaces).forEach(ifaceName => {
    interfaces[ifaceName].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIPs.push(iface.address);
      }
    });
  });
  return localIPs;
}

function isInCIDR(ip, cidr) {
  const [range, bits = 32] = cidr.split('/');
  const mask = ~((1 << (32 - bits)) - 1);
  const ipLong = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  const rangeLong = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  return (ipLong & mask) === (rangeLong & mask);
}

function getExcludedIPs() {
  const localIPs = getLocalIPs();
  const manualIPs = [];
  const cidrRanges = [
    '127.0.0.0/8',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '::1/128'
  ];
  return {
    exactIPs: [...localIPs, ...manualIPs, '::1', '127.0.0.1'],
    cidrRanges: cidrRanges
  };
}

const requestHistory = new Map();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(clientIP) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  if (!requestHistory.has(clientIP)) {
    requestHistory.set(clientIP, []);
  }
  const requests = requestHistory.get(clientIP);
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
  if (excluded.exactIPs.includes(clientIP)) {
    return true;
  }
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
          const backoffDelay = Math.pow(2, attempt) * 1000;
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

const excludedIPs = getExcludedIPs();
console.log('🔒 [STEALTH] Rate limiting excluded IPs:');
console.log('   Exact IPs:', excludedIPs.exactIPs);
console.log('   CIDR Ranges:', excludedIPs.cidrRanges);

const cookies = [
  {
    name: "AKA_A2",
    value: "A",
    domain: ".nseindia.com",
    path: "/",
    httpOnly: false,
    secure: true,
    expires: 1750924109
  },
  {
    name: "ak_bmsc",
    value: "3BD4B7F3F0489DE686E8D069891B4B5B~000000000000000000000000000000~YAAQhNcLF0OiqYCXAQAALrb+qhzKrQfjMsR5PQA6Y2fO362HIqY2ktO+ONDV27a8+TbY0eKZZLffk8AckkzZV1YF3da5mIVAMxPF+ZrUNXyq8LiwZ98vzFFVJNGSZYTumItGfI8bUPbJyUswg5DhPHHrT3v+wa1RNnMYkF+Iv5geK/PIaeKhti3fl+7id6OPh+daNzw6PFUHZxUObn+vF3+GA6Z5tYXMb+cm8+Vkt/zDJ6YBc0YWCJzRmfFAqSmIzHVFGLXI4Xx56SjxbPlpOXraNK/xdSBa0kCjWy56J9F6aQHiTlixQTC/AeBHqcpoRCMahAsRc34QmNP+iWpHtQhJiwzuR8/CfUpTxCMWaGbTJgLCRZeoa9/Ybinom9uVPbDoHu+n1qDV3w==",
    domain: ".nseindia.com",
    path: "/",
    httpOnly: false,
    secure: false,
    expires: 1750927709
  },
  {
    name: "ext_name",
    value: "ojplmecpdpgccookcobabopnaifgidhf",
    domain: "www.nseindia.com",
    path: "/",
    httpOnly: false,
    secure: false,
    expires: 1785480537
  },
  {
    name: "bm_sv",
    value: "5B71CCEBD428172FDEC92CCF386408C2~YAAQjdcLFxxGTYaXAQAAIx7/qhxYZ/99uizY7NLs1meqBiy8cdrOwMXptLdjOvzATamkJB2SQfl/NtnV1CCIEdh8vGhNgWI0padKOmShQGzwyN6u2HKvhkv081Xnnt/1Ee/jnK+pknl0mZJUmOUTGMNI4IA8alTkswcwwg7BOMXpz45xGpm5jQlywVTqa6yYgGfpR8z1tgowyU8ApA9jif07FH8lTHDvt2u1IVM/60Pwdcmzz1kGPNWTbde2XVT2d04r~1",
    domain: ".nseindia.com",
    path: "/",
    httpOnly: false,
    secure: true,
    expires: 1750922645
  },
  {
    name: "bm_sz",
    value: "74D9D993749290398F850789285546F8~YAAQjdcLFx1GTYaXAQAAIx7/qhwvc9DbQ6uH83fwqzEPf8x+5Ls5PArBXEpPEHaecvC+SBulCc3eGCWQ0TMdVvCVXPVJJYk+pU1rjAs3eIJSYQyIKk4wbQAcKdR7nYCB50+L5FgsrMm0I1Hh2IO+8K6kLS8E/Py+BSI9PMCNekmWBjCE6IoreLt5VBbgolermj357ZatbKnn8sfPxPN5GZuwYiiUTHMkpQrSNy3QbFoTtaRQdWFvEURRaeOZTkQnK8llJ63okah1iTqGLFVIHA0B8AUPzPRBKhvEcPu8R+DUzjsTKxDODEH5v6p18ZcqD0ImgTBZPZ86U+5zv6u0Nd/2VGdMrfoj0zsoHjQ0HKkE+R+JCCWCteJHfhHF1U7RBmenfh2kE0t4eDROeCkvlLA6TBooSmr6d/nCYzS572xPPzPSrcB/43vL6S4+TF0h+0hDF77Um8PRTNJNTROrVg98RZJ1LCio+ZEBG2tc8hZlkH2CFTK5y9XyfjPweqYRrMGwAV7B+SONPNY8OfJNspBGIQU8aQ==~3487301~3552313",
    domain: ".nseindia.com",
    path: "/",
    httpOnly: false,
    secure: false,
    expires: 1750929841
  },
  {
    name: "_abck",
    value: "F51B309D7D134C4620AFEE4FC31273E6~-1~YAAQjdcLF0hGTYaXAQAAxx7/qg61QuH63iz8UAfK9Wn4b1uh1IDwwCqA5TAwxHLn6EVPQlyhjmMOSzb/L0h+v74mpjtIu09CElyimzhMytkwadj/FaXm7UM6Qn09glkbQ30k3wLsVdKL+SUlZiuywK5cle+tOeI/c/yJCHrnfaDL7TP7aPsZFqrF0y8KO4kbTNZWA4sblWp+UFXwbzF8T0SK+i98yahcr2TBbAij4OftCRdu4lhuDUTmNH9Vy0XgZ+juCzND552dF7tcWgCCXD3KWLh0FKqipQqNZj/6X44pEWWTtQhh7p0zNnPGt3NCklOMhbiJ8J6DMCXNF3jW0eGNQ761IwUGOXqezJO7sWgFxGES1DnN4OjbYMQQ2IPsHVreWXn/D+qd4fbp7QQF7uvw4lNMlv22RcNvIwZfWRrxudb/dQZQ2dEp~-1~-1~-1",
    domain: ".nseindia.com",
    path: "/",
    httpOnly: false,
    secure: true,
    expires: 1782456536
  }
];

module.exports = async function (req, res) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  if (!isIPExcluded(clientIP)) {
    if (isRateLimited(clientIP)) {
      console.log(`[STEALTH] Rate limited for IP: ${clientIP}`);
      return res.status(429).json({
        error: 'Too many requests from this IP',
        message: 'Please wait a minute before making another request',
        retryAfter: 60,
        data: [],
        note: 'No data available due to rate limiting'
      });
    }
  } else {
    console.log(`[STEALTH] ✅ IP ${clientIP} excluded from rate limiting`);
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // userDataDir: '/tmp/puppeteer_profile', // Uncomment to use persistent profile
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.nseindia.com/',
      'Origin': 'https://www.nseindia.com',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });
    // Step 1: Go to NSE homepage to establish session
    await page.goto('https://www.nseindia.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000 + Math.random() * 2000);
    await page.mouse.move(100 + Math.random() * 200, 100 + Math.random() * 200);
    await page.mouse.move(200 + Math.random() * 200, 200 + Math.random() * 200);
    await page.keyboard.press('PageDown');
    await sleep(1000 + Math.random() * 2000);
    // Step 2: Fetch the ETF API endpoint with retry logic
    const apiUrl = 'https://www.nseindia.com/api/etf';
    const data = await fetchWithRetry(page, apiUrl);
    if (data && data.error === 'RATE_LIMITED_FINAL') {
      console.log('[STEALTH] NSE API rate limited after all retries');
      return res.status(429).json({
        error: 'NSE API rate limited',
        message: 'The NSE API is currently rate limited. Please try again later.',
        data: [],
        retryAfter: 300
      });
    }
    if (data && data.error === 'Not JSON') {
      console.log('[STEALTH] NSE API raw response:', data.text);
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
    if (data.data && data.data.length > 0) {
      console.log('[STEALTH] NSE ETF data structure (first item):', JSON.stringify(data.data[0], null, 2));
    }
    res.json(data);
  } catch (err) {
    console.error('[STEALTH] Puppeteer error:', err.message);
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