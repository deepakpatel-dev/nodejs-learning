// ─────────────────────────────────────────────
//  Parallel HTTPS Requests
//  Wraps https.get in a Promise so we can use
//  Promise.all() to fire all requests at once
//  and wait for all of them together.
// ─────────────────────────────────────────────
const https = require('https');
const { URL } = require('url');

// Wrap the callback-based https.get in a Promise
function fetchJson(targetUrl) {
  return new Promise((resolve, reject) => {
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

    const req = https.get(options, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`));
      }

      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (e) {
          reject(new Error(`JSON parse failed for ${targetUrl}: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error(`Timeout fetching ${targetUrl}`));
    });
  });
}

// ── Run all requests in parallel ─────────────
const URLS = [
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/posts/2',
  'https://jsonplaceholder.typicode.com/posts/3',
  'https://jsonplaceholder.typicode.com/users/1',
  'https://jsonplaceholder.typicode.com/todos/1',
];

console.log(`\n[PARALLEL] Firing ${URLS.length} requests simultaneously...\n`);

const startTime = Date.now();

// Promise.all fires every request at the same time
// and resolves when ALL of them are done
Promise.all(URLS.map(fetchJson))
  .then((results) => {
    const elapsed = Date.now() - startTime;
    console.log(`[PARALLEL] All ${results.length} requests completed in ${elapsed}ms\n`);
    results.forEach((data, i) => {
      console.log(`--- Result ${i + 1} (${URLS[i].split('/').slice(-2).join('/')}) ---`);
      console.log(data);
    });
  })
  .catch((err) => {
    console.error('[PARALLEL] One or more requests failed:', err.message);
  });

// ── allSettled: don't stop if one fails ──────
console.log('[PARALLEL] Also running with allSettled (tolerates failures)...');

const MIXED_URLS = [
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://jsonplaceholder.typicode.com/posts/99999', // this will 404
  'https://jsonplaceholder.typicode.com/users/1',
];

Promise.allSettled(MIXED_URLS.map(fetchJson)).then((results) => {
  console.log('\n[allSettled] Results:');
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`  ✓ ${MIXED_URLS[i]} → id: ${result.value.id}`);
    } else {
      console.log(`  ✗ ${MIXED_URLS[i]} → ${result.reason.message}`);
    }
  });
});
