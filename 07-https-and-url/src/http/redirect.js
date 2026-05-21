// ─────────────────────────────────────────────
//  HTTPS Redirect Follower
//  Node's https module does NOT follow redirects
//  automatically — this handles them manually.
//  Supports 301, 302, 303, 307, 308.
// ─────────────────────────────────────────────
const https = require('https');
const http = require('http');
const { URL } = require('url');

const MAX_REDIRECTS = 5; // guard against infinite redirect loops

function followRedirects(targetUrl, redirectCount = 0) {
  if (redirectCount > MAX_REDIRECTS) {
    console.error(`[REDIRECT] Too many redirects (>${MAX_REDIRECTS}). Stopping.`);
    return;
  }

  const url = new URL(targetUrl);

  // choose http or https module based on the URL protocol
  const transport = url.protocol === 'https:' ? https : http;

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'GET',
    headers: {
      'Accept': 'application/json, text/html',
      'User-Agent': 'NodeLearning/1.0'
    }
  };

  console.log(`\n[REDIRECT] Request #${redirectCount + 1} → ${targetUrl}`);

  const req = transport.get(options, (res) => {
    const { statusCode } = res;
    const location = res.headers['location'];

    console.log(`[REDIRECT] Status: ${statusCode}`);

    // 3xx with a Location header = redirect
    if ([301, 302, 303, 307, 308].includes(statusCode) && location) {
      // Location can be relative (e.g. /new-path) or absolute
      const nextUrl = new URL(location, targetUrl).href;
      console.log(`[REDIRECT] Redirecting to: ${nextUrl}`);
      res.resume(); // drain the body before following the redirect
      followRedirects(nextUrl, redirectCount + 1);
      return;
    }

    if (statusCode !== 200) {
      console.error(`[REDIRECT] Final status ${statusCode} – not following further.`);
      res.resume();
      return;
    }

    // Final destination — read the body
    let rawData = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log(`[REDIRECT] Final URL: ${targetUrl}`);
      console.log(`[REDIRECT] Body (first 300 chars):\n${rawData.slice(0, 300)}`);
    });
  });

  req.on('error', (e) => console.error('[REDIRECT] Network error:', e.message));
  req.setTimeout(10000, () => {
    console.error('[REDIRECT] Timeout');
    req.destroy();
  });
}

// http:// → automatically redirected to https:// by most servers (301)
followRedirects('http://jsonplaceholder.typicode.com/posts/1');
