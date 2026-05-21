// ─────────────────────────────────────────────
//  HTTPS GET Request
//  Fetches a single JSON resource from an API
// ─────────────────────────────────────────────
const https = require('https');
const { URL } = require('url');

const TARGET_URL = 'https://jsonplaceholder.typicode.com/posts/1';

function httpsGet(targetUrl) {
  const url = new URL(targetUrl);

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'NodeLearning/1.0'
    }
  };

  console.log(`\n[GET] Fetching: ${url}`);

  const req = https.get(options, (res) => {
    console.log(`[GET] Status: ${res.statusCode}`);

    if (res.statusCode !== 200) {
      console.error(`[GET] Failed – status ${res.statusCode}`);
      res.resume(); // drain socket to free memory
      return;
    }

    let rawData = '';
    res.setEncoding('utf8');

    res.on('data', (chunk) => { rawData += chunk; });

    res.on('end', () => {
      try {
        const data = JSON.parse(rawData);
        console.log('[GET] Response:', data);
      } catch (e) {
        console.error('[GET] JSON parse error:', e.message);
      }
    });
  });

  req.on('error', (e) => console.error('[GET] Network error:', e.message));

  req.setTimeout(10000, () => {
    console.error('[GET] Timeout – destroying request');
    req.destroy();
  });
}

httpsGet(TARGET_URL);
